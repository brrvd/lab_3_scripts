'use strict';

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

const loadBtn = document.getElementById('loadBtn');
const postsList = document.getElementById('postsList');
const messages = document.getElementById('messages');
const postForm = document.getElementById('postForm');
const titleInput = document.getElementById('title');
const bodyInput = document.getElementById('body');
const createBtn = document.getElementById('createBtn');


function clearMessages() {
    messages.innerHTML = '';
}

function showMessage(text, type = 'info') {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.textContent = text;
    messages.appendChild(div);
    return div;
}

function setLoading(button, isLoading, loadingText = 'Загрузка...') {
    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = loadingText;
        button.disabled = true;
    } else {
        button.textContent = button.dataset.originalText || button.textContent;
        button.disabled = false;
    }
}

function renderPost(title, body) {
    const card = document.createElement('div');
    card.className = 'post-card';

    const h3 = document.createElement('h3');
    h3.textContent = title;

    const p = document.createElement('p');
    p.textContent = body;

    card.append(h3, p);
    postsList.appendChild(card);
}

async function loadPosts() {
    clearMessages();
    postsList.innerHTML = '';
    setLoading(loadBtn, true, 'Загрузка...');
    showMessage('Загрузка публикаций...', 'info');

    try {
        const response = await fetch(`${API_URL}?_limit=5`);

        if (!response.ok) {
            throw new Error(`Ошибка сервера 400: ${response.status} ${response.statusText}`);
        }

        const posts = await response.json();

        clearMessages();
        posts.forEach((post) => renderPost(post.title, post.body));

        if (posts.length === 0) {
            showMessage('Публикации не найдены.', 'info');
        } else {
            showMessage(`Успешно загружено публикаций: ${posts.length}. 200`, 'success');
        }
    } catch (error) {
        clearMessages();
        showMessage(`Не удалось загрузить публикации: ${error.message} 500`, 'error');
    } finally {
        setLoading(loadBtn, false);
    }
}


function validateForm() {
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    titleInput.classList.toggle('invalid', !title);
    bodyInput.classList.toggle('invalid', !body);

    if (!title || !body) {
        clearMessages();
        showMessage('Заполните оба поля! 400', 'error');
        return null;
    }

    return { title, body };
}

async function createPost(event) {
    event.preventDefault();
    clearMessages();

    const data = validateForm();
    if (!data) return;

    setLoading(createBtn, true, 'Отправка...');
    showMessage('Отправка публикации...', 'info');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: data.title,
                body: data.body,
                userId: 1,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        clearMessages();
        showMessage(
            `Публикация создана. Заголовок: «${result.title}», ID: ${result.id}. 201`,
            'success'
        );

        postForm.reset();
        titleInput.classList.remove('invalid');
        bodyInput.classList.remove('invalid');
    } catch (error) {
        clearMessages();
        showMessage(`Не удалось создать публикацию: ${error.message}. 500`, 'error');
    } finally {
        setLoading(createBtn, false);
    }
}

loadBtn.addEventListener('click', loadPosts);
postForm.addEventListener('submit', createPost);

[titleInput, bodyInput].forEach((input) => {
    input.addEventListener('input', () => input.classList.remove('invalid'));
});