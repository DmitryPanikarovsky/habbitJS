'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;


/* page */

const page = {
    menu: document.querySelector('.navigate__menu'),
    header: {
        title: document.querySelector('.title'),
        progressPercent: document.querySelector('.progress__percent'),
        progressCoverBar: document.querySelector('.progress__cover-bar')
    },
    content: {
        daysContainer: document.querySelector('.days-list'),
        nextDay: document.querySelector('.number-day__text')
    }
}


/* utils  */

function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    const habbitArray = JSON.parse(habbitsString);
    if(Array.isArray(habbitArray)) {
        habbits = habbitArray;
    }
}

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}


/* render */

function rerenderMenu(activeHabbit) {
    for(const habbit of habbits) {
        const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
        if(!existed) {
            const element = document.createElement('li');
            element.setAttribute('menu-habbit-id', habbit.id);
            element.classList.add('navigate__item');
            element.addEventListener('click', () => rerender(habbit.id));
            element.innerHTML = `
                <button class="button button-navigate">
                    <img src="./img/icons/${habbit.icon}.svg" alt="${habbit.name}" class="navigate__img">
                </button>
            `;
            if(activeHabbit.id === habbit.id) {
                element.classList.add('navigate__item_active');
            }
            page.menu.appendChild(element);
            continue;
        }
        if(activeHabbit.id === habbit.id) {
            existed.classList.add('navigate__item_active');
        } else {
            existed.classList.remove('navigate__item_active');
        }
    }
}

function rerenderHead(activeHabbit) {
    page.header.title.innerText = activeHabbit.name;
    const progress = activeHabbit.days.length / activeHabbit.target > 1
        ? 100
        : activeHabbit.days.length / activeHabbit.target * 100;
    page.header.progressPercent.innerText = progress.toFixed(0) + '%';
    page.header.progressCoverBar.style.width = `${progress}%`;
}

function rerenderContent(activeHabbit) {
    page.content.daysContainer.innerHTML = '';
    for (const index in activeHabbit.days) {
        const element = document.createElement('li');
        element.classList.add('days-item');
        element.innerHTML = `
            <div class="number-day">
                <div class="number-day__text">День ${Number(index) + 1}</div>
            </div>
            <div class="comment-day">
                <div>
                    <div class="comment-day__text">${activeHabbit.days[index].comment}</div>
                    <button class="comment-day__delete">
                        <img src="./img/icons/delete.svg" alt="${index + 1}">
                    </button>
                </div>
            </div>
        `;
        page.content.daysContainer.appendChild(element);
    }
    page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
    globalActiveHabbitId = activeHabbitId;
    const activeHabbit = habbits.find(habbit => {
        return habbit.id === activeHabbitId;
    });
    if (!activeHabbit) {
        return;
    }
    rerenderMenu(activeHabbit);
    rerenderHead(activeHabbit);
    rerenderContent(activeHabbit);
}


/* work with days */

function addDays(event) {
    const form = event.target;
    event.preventDefault();
    const data = new FormData(form);
    const comment = data.get('comment');
    form['comment'].classList.remove('error');
    if(!comment) {
        form['comment'].classList.add('error');
        return;
    }
    habbits = habbits.map(habbit => {
        if(habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                days: habbit.days.concat([{ comment }])
            }
        }
        return habbit;
    });
    form['comment'].value = '';
    rerender(globalActiveHabbitId);
    saveData();
}


/* init */

(() => {
    loadData();
    rerender(habbits[0].id);
})();
