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
    },
    popup: {
        index: document.querySelector('.cover'),
        iconField: document.querySelector('.popup__form input[name="icon"]')
    }
}


/* utils  */

function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    const habbitArray = JSON.parse(habbitsString);
    if (Array.isArray(habbitArray)) {
        habbits = habbitArray;
    }
}

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

/*
function togglePopup() {
    if (page.popup.index.classList.contains('cover_hidden')) {
        page.popup.index.classList.remove('cover_hidden');
    } else {
        page.popup.index.classList.add('cover_hidden');
    }
}
*/

function togglePopup() {
    page.popup.index.classList.toggle('cover_hidden');
}

function resetForm(form, fields) {
    for (const field of fields) {
        form[field].value = '';
    }
}

function validateAndGetFormData(form, fields) {
    const formData = new FormData(form);
    const res = {};
    for (const field of fields) {
        const fieldValue = formData.get(field);
        form[field].classList.remove('error');
        if (!fieldValue) {
            form[field].classList.add('error');
        }
        res[field] = fieldValue;
    }
    let isValid = true;
    for (const field of fields) {
        if (!res[field]) {
            isValid = false;
        }
    }
    if (!isValid) {
        return;
    }
    return res;
}


/* render */

function rerenderMenu(activeHabbit) {
    for (const habbit of habbits) {
        const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
        if (!existed) {
            const element = document.createElement('li');
            element.setAttribute('menu-habbit-id', habbit.id);
            element.classList.add('navigate__item');
            element.addEventListener('click', () => rerender(habbit.id));
            element.innerHTML = `
                <button class="button button-navigate">
                    <img src="./img/icons/${habbit.icon}.svg" alt="${habbit.name}" class="navigate__img">
                </button>
            `;
            if (activeHabbit.id === habbit.id) {
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
                    <button class="comment-day__delete" onclick="deleteDay(${index})">
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
    event.preventDefault();
    const data = validateAndGetFormData(event.target, ['comment']);
    if (!data) {
        return;
    }
    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                days: habbit.days.concat([{ comment: data.comment }])
            }
        }
        return habbit;
    });
    resetForm(event.target, ['comment']);
    rerender(globalActiveHabbitId);
    saveData();
}

function deleteDay(index) {
    habbits = habbits.map(habbit => {
        if(habbit.id === globalActiveHabbitId) {
            habbit.days.splice(index, 1);
            return habbit;
        }
        return habbit;
    });
    rerender(globalActiveHabbitId);
    saveData();
}


/* work with habbit */

function setIcon(context, icon) {
    page.popup.iconField.value = icon;
    const iconActive = document.querySelector('.icon-list__button.icon-list__button_active');
    iconActive.classList.remove('icon-list__button_active');
    context.classList.add('icon-list__button_active');
}

function addHabbit(event) {
    event.preventDefault();
    const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
    if (!data) {
        return;
    }
    const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);
    habbits.push({
        id: maxId + 1 ,
        name: data.name,
        target: data.target,
        icon: data.icon,
        days: []
    });
    resetForm(event.target, ['name', 'target']);
    togglePopup();
    saveData();
    rerender(maxId + 1);
}


/* init */

(() => {
    loadData();
    rerender(habbits[0].id);
})();
