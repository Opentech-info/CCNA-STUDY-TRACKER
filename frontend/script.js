document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & CONSTANTS ---
    const STORAGE_KEY = 'ccna_project_tracker_v1';

    const DEFAULT_COLUMNS = [
        { id: 'basic', title: 'Basic Configurations', color: 'bg-blue-100 dark:bg-blue-900/30' },
        { id: 'switching', title: 'Switching Technologies', color: 'bg-pink-100 dark:bg-pink-900/30' },
        { id: 'routing', title: 'Routing Technologies', color: 'bg-green-100 dark:bg-green-900/30' },
        { id: 'wlan', title: 'WLAN & VoIP Technologies', color: 'bg-purple-100 dark:bg-purple-900/30' },
        { id: 'asa', title: 'Cisco ASA Firewall', color: 'bg-orange-100 dark:bg-orange-900/30' }
    ];

    const SAMPLE_TASKS = {
        basic: [
            { id: 'b1', title: 'Navigating User Levels', notes: '', done: false },
            { id: 'b2', title: 'Hostname', notes: '', done: false },
            { id: 'b3', title: 'Banner motd/message', notes: '', done: false },
            { id: 'b4', title: 'Enable Password', notes: '', done: false },
            { id: 'b5', title: 'Line console password', notes: '', done: false },
            { id: 'b6', title: 'Line VTY password', notes: '', done: false },
            { id: 'b7', title: 'Exec timeout', notes: '', done: false },
            { id: 'b8', title: 'Logging Synchronous', notes: '', done: false },
            { id: 'b9', title: 'Disabling IP domain lookup', notes: '', done: false },
            { id: 'b10', title: 'IP domain name', notes: '', done: false },
            { id: 'b11', title: 'Username and password', notes: '', done: false },
            { id: 'b12', title: 'Encrypting all passwords', notes: '', done: false },
            { id: 'b13', title: 'Set Current Clock Time', notes: '', done: false },
            { id: 'b14', title: 'Set management IP Address - SW', notes: '', done: false },
            { id: 'b15', title: 'Prevent Brute-force Attack - Router', notes: '', done: false }
        ],
        switching: [
            { id: 's1', title: 'VLANs', notes: '', done: false },
            { id: 's2', title: 'VLAN Trunking Protocol (VTP)', notes: '', done: false },
            { id: 's3', title: 'Trunk - Allowed/Denied VLANs', notes: '', done: false },
            { id: 's4', title: 'Configure Native VLAN', notes: '', done: false },
            { id: 's5', title: 'Remote Access - Telnet', notes: '', done: false },
            { id: 's6', title: 'Remote Access - SSH', notes: '', done: false },
            { id: 's7', title: 'L2 EtherChannel - PAGP/LACP', notes: '', done: false },
            { id: 's8', title: 'L2 EtherChannel - ON Mode', notes: '', done: false },
            { id: 's9', title: 'Secure All Unused Switchports', notes: '', done: false },
            { id: 's10', title: 'STP Attack Prevention', notes: '', done: false },
            { id: 's11', title: 'Disable CDP on the Devices', notes: '', done: false },
            { id: 's12', title: 'VLAN Hopping Attack Prevention', notes: '', done: false },
            { id: 's13', title: 'DHCP Snooping', notes: '', done: false },
            { id: 's14', title: 'Dynamic ARP Inspection', notes: '', done: false },
            { id: 's15', title: 'IP Source Guard', notes: '', done: false }
        ],
        routing: [
            { id: 'r1', title: 'Multilayer Switch + L3 EtherChannel', notes: '', done: false },
            { id: 'r2', title: 'Connecting Multiple Networks', notes: '', done: false },
            { id: 'r3', title: 'Remote Access - Telnet & SSH', notes: '', done: false },
            { id: 'r4', title: 'Inter-VLAN Routing - Router & L3 Switch', notes: '', done: false },
            { id: 'r5', title: 'DHCP Server - Router & L3 Switch', notes: '', done: false },
            { id: 'r6', title: 'Inter-VLAN + DHCP - Router & L3 Switch', notes: '', done: false },
            { id: 'r7', title: 'DHCP, DNS, Web, Email, FTP Servers', notes: '', done: false },
            { id: 'r8', title: 'DHCP Relay Agent - Router & L3 Switch', notes: '', done: false },
            { id: 'r9', title: 'Static, Floating & Default Routing', notes: '', done: false },
            { id: 'r10', title: 'RIP, EIGRP, OSPF & BGP Routing', notes: '', done: false },
            { id: 'r11', title: 'ACLs - Standard & Extended', notes: '', done: false },
            { id: 'r12', title: 'ACLs for VTY - Remote Access', notes: '', done: false },
            { id: 'r13', title: 'NAT - Static, Dynamic & PAT', notes: '', done: false },
            { id: 'r14', title: 'Normal HSRP, HSRP with VLANs', notes: '', done: false },
            { id: 'r15', title: 'IPv6 Configs + SLAAC', notes: '', done: false },
            { id: 'r16', title: 'Static Routing for IPv6', notes: '', done: false },
            { id: 'r17', title: 'RIPng for IPv6 Routing', notes: '', done: false },
            { id: 'r18', title: 'EIGRP for IPv6 Routing', notes: '', done: false },
            { id: 'r19', title: 'OSPF for IPv6 Routing', notes: '', done: false },
            { id: 'r20', title: 'WAN PPP - CHAP', notes: '', done: false }
        ],
        wlan: [
            { id: 'w1', title: 'Wireless APs Configs', notes: '', done: false },
            { id: 'w2', title: 'Wireless LAN Controller (WLC)', notes: '', done: false },
            { id: 'w3', title: 'VoIP Device Selection', notes: '', done: false },
            { id: 'w4', title: 'VoIP DHCP Configs', notes: '', done: false },
            { id: 'w5', title: 'VoIP Phones Configs', notes: '', done: false },
            { id: 'w6', title: 'VoIP - Data & Voice VLANs', notes: '', done: false },
            { id: 'w7', title: 'Routing for VoIP - Dial-Peering', notes: '', done: false }
        ],
        asa: [
            { id: 'a1', title: 'Basic Firewall Configs', notes: '', done: false },
            { id: 'a2', title: 'Interface Security Levels', notes: '', done: false },
            { id: 'a3', title: 'Firewall Policies', notes: '', done: false },
            { id: 'a4', title: 'Firewall NAT Configs', notes: '', done: false },
            { id: 'a5', title: 'Firewall ACLs', notes: '', done: false },
            { id: 'a6', title: 'NAT + Network Objects', notes: '', done: false },
            { id: 'a7', title: 'Inspection Policies', notes: '', done: false },
            { id: 'a8', title: 'IPv6', notes: '', done: false }
        ]
    };

    let state = {
        columns: DEFAULT_COLUMNS,
        data: {},
        search: '',
        dark: false,
        lang: 'en',
    };

    let autosaveTimeout = null;
    let draggedElement = null;

    // --- UTILITY FUNCTIONS ---
    const uid = (prefix = '') => prefix + Math.random().toString(36).slice(2, 9);

    const getProgressColor = (progress) => {
        if (progress === 100) {
            return 'text-green-600 dark:text-green-400 font-bold';
        }
        if (progress > 50) {
            return 'text-blue-600 dark:text-blue-400';
        }
        if (progress > 0) {
            return 'text-orange-500 dark:text-orange-400';
        }
        return 'opacity-70'; // Default for 0%
    };

    let translations = {};
    const loadTranslations = async () => {
        try {
            const response = await fetch('translations.json');
            translations = await response.json();
        } catch (e) {
            console.error("Could not load translations.", e);
        }
    };

    const t = (key) => {
        return translations[key]?.[state.lang] || translations[key]?.['en'] || key;
    };


    const saveState = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    };

    const scheduleAutosave = () => {
        if (autosaveTimeout) clearTimeout(autosaveTimeout);
        autosaveTimeout = setTimeout(() => {
            saveState();
            console.log("Autosaved.");
        }, 1200);
    };

    const loadState = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                state.data = JSON.parse(raw);
            } else {
                state.data = SAMPLE_TASKS;
            }
        } catch (e) {
            console.error("Failed to load state from localStorage", e);
            state.data = SAMPLE_TASKS;
        }
        // Ensure all columns exist in data
        state.columns.forEach(col => {
            if (!state.data[col.id]) {
                state.data[col.id] = [];
            }
        });
    };

    // --- DOM MANIPULATION & RENDERING ---

    const mainContent = document.getElementById('main-content');

    const render = () => {
        mainContent.innerHTML = ''; // Clear existing content
        state.columns.forEach(col => {
            const colEl = createColumnElement(col);
            mainContent.appendChild(colEl);
        });
        updateDarkMode();
        updateStaticText();
        scheduleAutosave();
    };

    const createColumnElement = (col) => {
        const section = document.createElement('section');
        section.className = `rounded-lg shadow p-4 ${col.color}`;
        section.dataset.colId = col.id;

        // Drag and drop for the column
        section.addEventListener('dragover', onDragOver);
        section.addEventListener('drop', (e) => onDrop(e, col.id));

        const progress = getProgress(col.id);
        const progressColorClass = getProgressColor(progress);

        section.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <h2 class="font-semibold text-base">${col.title}</h2>
                <div class="text-sm font-medium ${progressColorClass}">${progress}%</div>
            </div>
            <div class="mb-2 flex gap-2 flex-wrap">
                <form class="task-adder flex-1 flex gap-2" data-col-id="${col.id}">
                    <input type="text" placeholder="${t('add_new_task_placeholder')}" class="px-3 py-2 text-sm rounded-md border w-full bg-white/50 dark:bg-gray-800/50 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" class="px-4 py-2 text-sm rounded-md border dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">${t('add_button')}</button>
                </form>
            </div>
            <div class="mb-2 flex gap-2 flex-wrap no-print">
                <button data-action="bulk-done" class="px-2 py-1 rounded-md border text-xs dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">✓ All</button>
                <button data-action="bulk-undo" class="px-2 py-1 rounded-md border text-xs dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Undo</button>
                <button data-action="clear-completed" class="px-2 py-1 rounded-md border text-xs dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Clear</button>
            </div>
            <div class="task-list space-y-2 max-h-[60vh] overflow-y-auto p-1 -m-1">
                <!-- Tasks will be rendered here -->
            </div>
        `;

        const taskList = section.querySelector('.task-list');
        const filteredTasks = getFilteredData(col.id);

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<div class="text-sm opacity-60 p-2">No tasks</div>`;
        } else {
            filteredTasks.forEach(task => {
                const taskEl = createTaskElement(task, col.id);
                taskList.appendChild(taskEl);
            });
        }

        // Add event listeners for column actions
        section.querySelector('.task-adder').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = e.target.querySelector('input');
            if (input.value.trim()) {
                addTask(col.id, input.value.trim());
                input.value = '';
            }
        });
        section.querySelector('[data-action="bulk-done"]').addEventListener('click', () => bulkToggle(col.id, true));
        section.querySelector('[data-action="bulk-undo"]').addEventListener('click', () => bulkToggle(col.id, false));
        section.querySelector('[data-action="clear-completed"]').addEventListener('click', () => clearCompleted(col.id));

        return section;
    };

    const createTaskElement = (task, colId) => {
        const article = document.createElement('article');
        let doneClasses = task.done 
            ? 'opacity-70 bg-green-50 dark:bg-green-900/20' 
            : 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800';

        // Add fade-in animation for new tasks
        if (task.isNew) {
            doneClasses += ' task-fade-in';
            delete task.isNew; // Remove the flag after use
        }
        
        article.className = `task p-3 rounded-lg border dark:border-gray-700 shadow-sm transition-all cursor-grab ${doneClasses}`;
        article.draggable = true;
        article.dataset.taskId = task.id;
        article.dataset.colId = colId;

        article.addEventListener('dragstart', (e) => onDragStart(e, task.id));
        article.addEventListener('drop', (e) => onDropOnTask(e, colId, task.id)); // Drop on task needs colId
        article.addEventListener('dragover', onDragOver); // This is generic

        article.innerHTML = `
            <div class="flex items-start justify-between gap-2 relative">
                <div class="flex items-start gap-2 flex-1">
                    <input type="checkbox" class="task-done-toggle mt-1 flex-shrink-0" ${task.done ? 'checked' : ''}>
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            ${task.done ? '<span class="text-yellow-500">★</span>' : ''}
                            <a href="command.html?topic=${task.id}" class="editable-title font-medium text-sm hover:underline" title="Click to see commands">
                                ${task.title || '<em class="opacity-50">Untitled task</em>'}
                            </a>
                        </div>
                        <div class="text-xs opacity-60 mt-1">${task.notes ? task.notes.substring(0, 120) + (task.notes.length > 120 ? '...' : '') : '<em class="opacity-50">No notes</em>'}</div>
                    </div>
                </div>
                <div class="flex flex-col items-end gap-2 no-print">
                    <div class="flex gap-2">
                        <button class="edit-notes-btn px-2 py-1 rounded-md border text-xs dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">${t('notes_button')}</button>
                        <button class="star-task-btn p-1 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors" title="Star this task">
                            <svg class="w-4 h-4 ${task.starred ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        </button>
                    </div>
                </div>
                <!-- Star animation container -->
                <div class="star-animation-container"></div>
            </div>
        `;

        // Add event listeners for task actions
        article.querySelector('.task-done-toggle').addEventListener('change', () => toggleDone(colId, task.id));
        article.querySelector('.star-task-btn').addEventListener('click', (e) => toggleStarred(colId, task.id, e.currentTarget));
        article.querySelector('.edit-notes-btn').addEventListener('click', () => showNotesModal(colId, task.id));
        // Disabling dblclick to edit title to avoid conflict with the link
        // article.querySelector('.editable-title').addEventListener('dblclick', (e) => {
        //     e.preventDefault(); // Prevent navigation
        //     const target = e.currentTarget;
        //     target.contentEditable = true;
        //     target.focus();
        //     target.onblur = () => {
        //         target.contentEditable = false;
        //         updateTask(colId, task.id, { title: target.innerText });
        //     };
        //     target.onkeydown = (keyEvent) => {
        //         if (keyEvent.key === 'Enter') {
        //             keyEvent.preventDefault();
        //             target.blur();
        //         }
        //     };
        // });

        return article;
    };

    const updateDarkMode = () => {
        const toggleIcon = document.getElementById('dark-mode-toggle').querySelector('svg');
        if (state.dark) {
            document.documentElement.classList.add('dark');
            // Sun icon
            toggleIcon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
        } else {
            document.documentElement.classList.remove('dark');
            // Moon icon
            toggleIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
        }
    };

    const updateStaticText = () => {
        document.getElementById('app-title').textContent = t('app_title');
        document.getElementById('app-subtitle').textContent = t('app_subtitle');
        document.getElementById('search-input').placeholder = t('search_placeholder');
        // Any other static text can be updated here
    };

    // --- MODAL LOGIC ---
    const notesModalOverlay = document.getElementById('notes-modal-overlay');
    const notesModal = document.getElementById('notes-modal');
    const notesTextarea = document.getElementById('notes-modal-textarea');

    const showNotesModal = (colId, taskId) => {
        const task = state.data[colId].find(t => t.id === taskId);
        if (!task) return;
        notesTextarea.value = task.notes || '';
        notesModal.dataset.colId = colId;
        notesModal.dataset.taskId = taskId;
        notesModalOverlay.classList.add('visible');
        notesTextarea.focus();
    };

    const hideNotesModal = () => {
        notesModalOverlay.classList.remove('visible');
    };

    const saveNotesFromModal = () => {
        const { colId, taskId } = notesModal.dataset;
        if (!colId || !taskId) return;
        const newNotes = notesTextarea.value;
        updateTask(colId, taskId, { notes: newNotes });
        hideNotesModal();
    };

    // --- BUSINESS LOGIC & STATE MANAGEMENT ---

    const getProgress = (colId) => {
        const list = state.data[colId] || [];
        if (!list.length) return 0;
        return Math.round((list.filter(t => t.done).length / list.length) * 100);
    };

    const getFilteredData = (colId) => {
        const list = state.data[colId] || [];
        if (!state.search) return list;
        const q = state.search.toLowerCase();
        return list.filter(t => (t.title || '').toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q));
    };

    const addTask = (colId, title) => {
        const task = { id: uid('t'), title, notes: '', done: false, starred: false, isNew: true };
        state.data[colId].unshift(task);
        render();
    };

    const updateTask = (colId, taskId, fields) => {
        const task = state.data[colId].find(t => t.id === taskId);
        if (task) {
            Object.assign(task, fields);
            render();
        }
    };

    const deleteTask = (colId, taskId) => {
        state.data[colId] = state.data[colId].filter(t => t.id !== taskId);
        render();
    };

    const toggleDone = (colId, taskId) => {
        const task = state.data[colId].find(t => t.id === taskId);
        if (task) {
            const wasDone = task.done;
            task.done = !task.done;
            if (task.done && !wasDone) {
                const taskEl = document.querySelector(`[data-task-id="${taskId}"]`);
                if (taskEl) {
                    triggerStarAnimation(taskEl);
                }
            }
            render();
        }
    };

    const toggleStarred = (colId, taskId, buttonEl) => {
        const task = state.data[colId].find(t => t.id === taskId);
        if (task) {
            task.starred = !task.starred;
            if (task.starred) {
                triggerStarAnimation(buttonEl);
            }
            render();
        }
    };

    const triggerStarAnimation = (element) => {
        const container = element.closest('.task').querySelector('.star-animation-container');
        if (!container) return;

        // Create and animate multiple stars
        for (let i = 0; i < 12; i++) {
            const star = document.createElement('div');
            star.className = 'star-particle';
            // Randomize position, size, and animation delay
            star.style.setProperty('--tx', `${Math.random() * 160 - 80}px`);
            star.style.setProperty('--ty', `${Math.random() * 160 - 80}px`);
            star.style.setProperty('--s', `${Math.random() * 0.7 + 0.3}`);
            star.style.setProperty('--d', `${Math.random() * 0.2}s`);
            container.appendChild(star);

            star.addEventListener('animationend', () => star.remove());
        }
    }

    const clearCompleted = (colId) => {
        state.data[colId] = state.data[colId].filter(t => !t.done);
        render();
    };

    const bulkToggle = (colId, doneValue) => {
        state.data[colId].forEach(t => t.done = doneValue);
        render();
    };

    // --- DRAG & DROP ---

    const onDragStart = (e, taskId) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ taskId }));
        e.dataTransfer.effectAllowed = 'move';
        draggedElement = e.target;
        setTimeout(() => {
            draggedElement.classList.add('dragging');
        }, 0);
    };

    const onDragEnd = () => {
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
            draggedElement = null;
        }
        document.querySelectorAll('.task-ghost').forEach(el => el.remove());
    };

    const onDragOver = (e) => {
        e.preventDefault();
        const dropTarget = e.target.closest('.task-list');
        if (!dropTarget) return;

        document.querySelectorAll('.task-ghost').forEach(el => el.remove());

        const ghost = document.createElement('div');
        ghost.className = 'task-ghost h-16'; // Match approx height of a task

        const afterElement = getDragAfterElement(dropTarget, e.clientY);
        if (afterElement == null) {
            dropTarget.appendChild(ghost);
        } else {
            dropTarget.insertBefore(ghost, afterElement);
        }
    };

    const onDrop = (e, toCol) => {
        e.preventDefault();
        onDragEnd();
        try {
            const payload = JSON.parse(e.dataTransfer.getData('text/plain'));
            const { taskId } = payload;
            if (!taskId) return;

            // Find the 'from' column by searching through the data
            let fromCol = null;
            for (const colKey in state.data) {
                if (state.data[colKey].some(t => t.id === taskId)) fromCol = colKey;
            }

            if (!fromCol || !taskId || fromCol === toCol) return;

            const taskIndex = state.data[fromCol].findIndex(t => t.id === taskId);
            if (taskIndex === -1) return;

            const [movingTask] = state.data[fromCol].splice(taskIndex, 1);
            
            const toList = state.data[toCol];
            const dropTarget = e.target.closest('.task-list');
            const afterElement = dropTarget ? getDragAfterElement(dropTarget, e.clientY) : null;
            const toIndex = afterElement ? toList.findIndex(t => t.id === afterElement.dataset.taskId) : toList.length;

            toList.splice(toIndex, 0, movingTask);

            render();
        } catch (err) { console.error("Drop failed:", err); }
    };

    const onDropOnTask = (e, toCol, toTaskId) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent bubbling up to the column's drop handler
        onDragEnd();
        try {
            const payload = JSON.parse(e.dataTransfer.getData('text/plain'));
            const { taskId } = payload;
            if (!taskId) return;

            // Find the 'from' column
            let fromCol = null;
            for (const colKey in state.data) {
                if (state.data[colKey].some(t => t.id === taskId)) fromCol = colKey;
            }

            const fromList = state.data[fromCol];
            const movingIndex = fromList.findIndex(t => t.id === taskId);
            if (movingIndex === -1) return;

            const [movingTask] = fromList.splice(movingIndex, 1);

            const toList = state.data[toCol];
            const toIndex = toList.findIndex(t => t.id === toTaskId);

            toList.splice(toIndex + 1, 0, movingTask);
            render();
        } catch (err) { console.error("Drop on task failed:", err); }
    };

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Add a single listener to the window to handle drag end
    window.addEventListener('dragend', onDragEnd);

    // --- IMPORT / EXPORT ---

    const exportJson = () => {
        const blob = new Blob([JSON.stringify({ columns: state.columns, data: state.data }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'ccna-tracker.json'; a.click();
        URL.revokeObjectURL(url);
    };

    const importJson = (file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target.result);
                if (parsed && parsed.data) {
                    state.data = parsed.data;
                    render();
                    alert('Import successful');
                } else alert('Invalid JSON file');
            } catch (err) { alert('Unable to parse JSON'); }
        };
        reader.readAsText(file);
    };

    const exportCsv = () => {
        const lines = ['column,title,notes,done'];
        for (const col of state.columns) {
            for (const t of (state.data[col.id] || [])) {
                const row = [col.title, `"${(t.title || '').replace(/"/g, '""')}"`, `"${(t.notes || '').replace(/"/g, '""')}"`, t.done ? '1' : '0'];
                lines.push(row.join(','));
            }
        }
        const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'ccna-tracker.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const importCsv = (file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target.result;
            const rows = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
            if (rows.length <= 1) return alert('CSV empty or has no data rows');
            
            const newData = {};
            state.columns.forEach(c => newData[c.id] = []);

            for (let i = 1; i < rows.length; i++) {
                const cols = rows[i].split(',');
                if (cols.length < 4) continue;
                const p = { columnTitle: cols[0].replace(/^"|"$/g, ''), title: cols[1].replace(/^"|"$/g, ''), notes: cols[2].replace(/^"|"$/g, ''), done: cols[3].trim() === '1' };
                const col = state.columns.find(c => c.title === p.columnTitle) || state.columns[0];
                newData[col.id].push({ id: uid('t'), title: p.title, notes: p.notes, done: p.done });
            }
            state.data = newData;
            render();
            alert('CSV imported');
        };
        reader.readAsText(file);
    };

    const exportToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(state.data)).then(() => alert('Saved to clipboard'));
    };

    // --- INITIALIZATION & EVENT LISTENERS ---

    const init = async () => {
        await loadTranslations();
        document.getElementById('search-input').addEventListener('input', (e) => {
            state.search = e.target.value;
            render();
        });
        document.getElementById('dark-mode-toggle').addEventListener('click', () => {
            state.dark = !state.dark;
            updateDarkMode();
            // Persist dark mode preference
            try { localStorage.setItem('ccna_dark_mode', state.dark); } catch (e) { }
        });
        document.getElementById('export-json-btn').addEventListener('click', exportJson);
        document.getElementById('export-csv-btn').addEventListener('click', exportCsv);
        document.getElementById('copy-json-btn').addEventListener('click', exportToClipboard);
        document.getElementById('reset-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                localStorage.removeItem(STORAGE_KEY);
                state.data = SAMPLE_TASKS;
                render();
                alert('Reset to sample data');
            }
        });
        document.getElementById('print-btn').addEventListener('click', () => window.print());

        // Language Switcher
        const langSwitcherDesktop = document.getElementById('lang-switcher-desktop');
        const langSwitcherMobile = document.getElementById('lang-switcher-mobile');
        langSwitcherDesktop.innerHTML = '';
        langSwitcherMobile.innerHTML = '';
        ['en', 'sw'].forEach(lang => {
            const btn = document.createElement('button'); // Create button for desktop
            btn.textContent = lang.toUpperCase();
            btn.className = `px-2 py-0.5 rounded text-sm transition-colors`;
            if (state.lang === lang) {
                btn.classList.add('bg-blue-500', 'text-white');
            } else {
                btn.classList.add('hover:bg-gray-200', 'dark:hover:bg-gray-700');
            }
            btn.addEventListener('click', () => {
                state.lang = lang;
                localStorage.setItem('ccna_lang', lang);
                init(); // Re-initialize to re-render everything in the new language
            });
            langSwitcherDesktop.appendChild(btn);

            const mobileBtn = btn.cloneNode(true); // Clone for mobile
            mobileBtn.addEventListener('click', btn.onclick);
            langSwitcherMobile.appendChild(mobileBtn);
        });

        // Modal Listeners
        document.getElementById('notes-modal-cancel').addEventListener('click', hideNotesModal);
        document.getElementById('notes-modal-save').addEventListener('click', saveNotesFromModal);
        notesModalOverlay.addEventListener('click', (e) => {
            if (e.target === notesModalOverlay) hideNotesModal();
        });

        // Mobile Menu Toggle
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));


        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                saveState();
                alert('Saved!');
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                document.getElementById('search-input').focus();
            }
            if (e.key === 'Escape' && notesModalOverlay.classList.contains('visible')) {
                hideNotesModal();
            }
        });

        // Load initial data and render
        try {
            const storedDark = localStorage.getItem('ccna_dark_mode');
            if (storedDark) state.dark = JSON.parse(storedDark);
            const storedLang = localStorage.getItem('ccna_lang');
            if (storedLang) state.lang = storedLang;
        } catch (e) {
            console.error("Failed to load settings from localStorage", e);
        }

        loadState();
        render();
    };

    init();
});