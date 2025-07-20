document.addEventListener('DOMContentLoaded', () => {
    const entriesContainer = document.getElementById('entries-container');
    const addEntryBtn = document.getElementById('add-entry-btn');
    const entryTitleInput = document.getElementById('entry-title');
    const entryDateInput = document.getElementById('entry-date');
    const contextMenu = document.getElementById('context-menu');
    let currentEntryIndex = null;

    let entries = JSON.parse(localStorage.getItem('dateEntries')) || [
        { title: "Our First Kiss", date: "2022-01-20" },
        { title: "Anniversary", date: "2021-07-15" }
    ];

    const saveEntries = () => {
        localStorage.setItem('dateEntries', JSON.stringify(entries));
    };

    const calculateDaysSince = (dateString) => {
        const startDate = new Date(dateString);
        const today = new Date();
        startDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const difference = today.getTime() - startDate.getTime();
        return Math.floor(difference / (1000 * 60 * 60 * 24));
    };

    const renderEntries = () => {
        entriesContainer.innerHTML = '';
        entries.forEach((entry, index) => {
            const days = calculateDaysSince(entry.date);
            const entryElement = document.createElement('div');
            entryElement.classList.add('entry');
            entryElement.dataset.index = index;
            entryElement.innerHTML = `
                <div class="days">${days}</div>
                <div class="title" contenteditable="false">${entry.title}</div>
                <div class="start-date">Since: ${entry.date}</div>
            `;
            entriesContainer.appendChild(entryElement);
        });
    };

    const showContextMenu = (e) => {
        e.preventDefault();
        const entryElement = e.target.closest('.entry');
        if (!entryElement) return;

        currentEntryIndex = entryElement.dataset.index;
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.top = `${e.pageY}px`;
    };

    const hideContextMenu = () => {
        contextMenu.style.display = 'none';
        currentEntryIndex = null;
    };

    const addEntry = () => {
        const title = entryTitleInput.value.trim();
        const date = entryDateInput.value;
        if (!title || !date) {
            alert('Please provide both a title and a date.');
            return;
        }
        entries.push({ title, date });
        saveEntries();
        renderEntries();
        entryTitleInput.value = '';
        entryDateInput.value = '';
    };

    const deleteEntry = (index) => {
        entries.splice(index, 1);
        saveEntries();
        renderEntries();
    };

    const enableTitleEdit = (index) => {
        const entryElement = document.querySelector(`.entry[data-index='${index}']`);
        const titleElement = entryElement.querySelector('.title');
        titleElement.contentEditable = true;
        titleElement.focus();
        entryElement.classList.add('editing');
        
        titleElement.addEventListener('blur', () => {
            titleElement.contentEditable = false;
            entries[index].title = titleElement.innerText;
            entryElement.classList.remove('editing');
            saveEntries();
        });
    };

    const enableDateEdit = (index) => {
        const entryElement = document.querySelector(`.entry[data-index='${index}']`);
        const tempInput = document.createElement('input');
        tempInput.type = 'date';
        tempInput.value = entries[index].date;
        entryElement.classList.add('editing');

        tempInput.addEventListener('change', () => {
            entries[index].date = tempInput.value;
            saveEntries();
            renderEntries();
        });
        
        tempInput.addEventListener('blur', () => {
            if (entryElement.contains(tempInput)) {
                 renderEntries(); // Re-render to remove input
            }
        });

        const startDateElement = entryElement.querySelector('.start-date');
        startDateElement.innerHTML = '';
        startDateElement.appendChild(tempInput);
        tempInput.focus();
    };

    addEntryBtn.addEventListener('click', addEntry);
    entriesContainer.addEventListener('contextmenu', showContextMenu);
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });

    contextMenu.addEventListener('click', (e) => {
        if (currentEntryIndex === null) return;
        const targetId = e.target.id;
        
        if (targetId === 'delete-option') {
            deleteEntry(currentEntryIndex);
        } else if (targetId === 'edit-title-option') {
            enableTitleEdit(currentEntryIndex);
        } else if (targetId === 'edit-date-option') {
            enableDateEdit(currentEntryIndex);
        }
        hideContextMenu();
    });

    renderEntries();
    setInterval(renderEntries, 1000 * 60 * 60 * 24);
}); 