
function createElemWithText(name = "p", content = "", nameOfClass) {
    let createdElement = document.createElement(name);
    createdElement.textContent = content;
    if (nameOfClass) {
        createdElement.className = nameOfClass;
    }
    return createdElement;
}


function createSelectOptions(usersData) {

    if(!usersData){
        return undefined;
    }

    let optionsArray = [];

    usersData.forEach((data) => {
        let option = document.createElement("option");
        option.value = data.id;
        option.textContent = data.name;
        optionsArray.push(option);
    })

    return optionsArray;
}


function toggleCommentSection(postId) {
    if(!postId){
        return undefined;
    }

    let sectionElement = document.querySelector(`section[data-post-id="${postId}"]`);
    if(sectionElement){
        sectionElement.classList.toggle('hide');
    }
    return sectionElement;
}


function toggleCommentButton(postId){

    if(!postId){
        return undefined;
    }

    const buttonElement = document.querySelector(`button[data-post-id="${postId}"]`);

    if (!buttonElement) {
        return null;
    }
    
    buttonElement.textContent = buttonElement.textContent === 'Show Comments' ? 'Hide Comments' : 'Show Comments';
    return buttonElement;
}


function deleteChildElements(parentElement) { 

    if(!(parentElement instanceof Element)){
        return undefined
    }

    let childVar = parentElement.lastElementChild;

    while(childVar){
        parentElement.removeChild(childVar);
        childVar = parentElement.lastElementChild;
    }

    return parentElement;
}

function addButtonListeners(){

    const allButtons = document.querySelectorAll('main button');


    if (allButtons) {
        allButtons.forEach((button) => {
            let postId = button.dataset.postId;
            if (postId) {
            
                const handleClick = function (e) {
                    toggleComments(e, postId);
                };

                button._handleClick = handleClick;

                button.addEventListener('click', handleClick);
            }
        });
    }

    return allButtons;
}


function removeButtonListeners(){
    
    const allButtons = document.querySelectorAll('main button');

    if (allButtons.length === 0) {
        return allButtons;
    }

    allButtons.forEach((button) => {
        let postId = button.dataset.id;

        if(postId){
            button.removeEventListener('click', button._handleClick);
        }
    });
    return allButtons;
}


function createComments(jsonComments) { 
    let fragment = document.createDocumentFragment();

    if(!jsonComments) return;

    jsonComments.forEach((comment) => {
        let articleElem = document.createElement('article');
        const h3Elem = createElemWithText('h3', comment.name);
        const para1 = createElemWithText('p', comment.body);
        const para2 = createElemWithText('p', `From: ${comment.email}`)

        articleElem.append(h3Elem, para1, para2);
        fragment.append(articleElem);
    });
    return fragment;
}


function populateSelectMenu(usersData){

    if(!usersData) return;

    const selectMenu = document.getElementById('selectMenu');

    let arrayOptions = createSelectOptions(usersData);
    arrayOptions.forEach((option) => {
        selectMenu.append(option);
    });

    return selectMenu;
}

const getUsers = async () => {
    try{
    const data = await fetch('https://jsonplaceholder.typicode.com/users');

    if(!data.ok){
        throw new Error("Data not in range");
    }

    return await data.json();
    } catch(err) {
        console.error(err);
    }
}

const getUserPosts = async (userid) => {
    if(!userid) return undefined;

    try{
        const data = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userid}`);
    
        if(!data.ok){
            throw new Error("Data not in range");
        }
    
        return await data.json();
        } catch(err) {
            console.error(err);
        }
}

const getUser = async (userid) => {
    if(!userid) return undefined;

    try{
        const data = await fetch(`https://jsonplaceholder.typicode.com/users/${userid}`);
    
        if(!data.ok){
            throw new Error("Data not in range");
        }
    
        return await data.json();

        } catch(err) {
            console.error(err);
        }
}

const getPostComments = async(postid) => {
    if(!postid) return undefined;

    try{
        const data = await fetch(`https://jsonplaceholder.typicode.com/posts/${postid}/comments`);
    
        if(!data.ok){
            throw new Error("Data not in range");
        }
    
        return await data.json();

        } catch(err) {
            console.error(err);
        }
}

const displayComments = async (postId) => {

    if(!postId) return undefined;
    
    const secElement = document.createElement('section');

    secElement.dataset.postId = `${postId}`;

    secElement.classList.add('comments', 'hide');

    const comments = await getPostComments(postId);

    const fragment = createComments(comments);

    secElement.append(fragment);

    return secElement;
}

const createPosts = async (data) => {
    if(!data) return undefined;
    const fragment = document.createDocumentFragment();

    for(const post of data) {
        const art = document.createElement('article');
        const h2 = createElemWithText('h2', post.title);
        const p1 = createElemWithText('p', post.body);
        const p2 = createElemWithText('p', `Post ID: ${post.id}`);
        const author = await getUser(post.userId);
        const p3 = createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
        const p4 = createElemWithText('p', author.company.catchPhrase)
        const button = document.createElement('button');
        button.textContent = 'Show Comments';
        button.dataset.postId = post.id;
        art.append(h2, p1, p2,p3, p4, button);
        const section = await displayComments(post.id);
        art.append(section);
        fragment.append(art);
    }

    return fragment;
}

const displayPosts = async (postsData) => {

    const main = document.querySelector('main');

    const element = postsData? await createPosts(postsData) : createElemWithText('p', 'Select an Employee to display their posts.', 'default-text');

    main.append(element);

    return element;
}

function toggleComments(event, postId) {
   if(!event || !postId) return undefined;
   
    event.target.listener = true;
    
    return [toggleCommentSection(postId), toggleCommentButton(postId)]
}

const refreshPosts = async (postsData) => {

    if(!postsData) return undefined;
    const removedButtons = removeButtonListeners();

    const main = document.querySelector('main');
    const mainElement = deleteChildElements(main);

    const postsDisplayed = await displayPosts(postsData);


    const addedButtons = addButtonListeners();

    return [removedButtons, mainElement, postsDisplayed, addedButtons];

}

const selectMenuChangeEventHandler = async (event) => {

    if(!event) return undefined;

    const selectMenu = document.querySelector('#selectMenu');
    selectMenu.disabled = true;

    const userId = event?.target?.value || 1;

    const posts = await getUserPosts(userId);

    const refreshPostsArray = await refreshPosts(posts);

    selectMenu.disabled = false;

    return [userId, posts, refreshPostsArray];
}

const initPage = async () => {
    
    const data = await getUsers();

    const selectElement = populateSelectMenu(data);

    return [data, selectElement];
}

function initApp() {
    initPage();

    const selectMenu = document.querySelector('#selectMenu');

    selectMenu.addEventListener('change', selectMenuChangeEventHandler);
}

document.addEventListener('DOMContentLoaded', initApp);