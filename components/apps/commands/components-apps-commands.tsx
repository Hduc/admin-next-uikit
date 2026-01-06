'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import Dropdown from '@/components/dropdown';
import IconSearch from '@/components/icon/icon-search';
import IconMenu from '@/components/icon/icon-menu';
import IconPlus from '@/components/icon/icon-plus';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconStar from '@/components/icon/icon-star';
import IconX from '@/components/icon/icon-x';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconCode from '@/components/icon/icon-code';
import IconCopy from '@/components/icon/icon-copy';
import IconFolder from '@/components/icon/icon-folder';
import { IRootState } from '@/store';

// Types
interface Command {
    id: number;
    title: string;
    command: string;
    description: string;
    groupId: number;
    isFav: boolean;
}

interface Group {
    id: number;
    name: string;
    color: string;
}

// Sample Data
const initialGroups: Group[] = [
    { id: 1, name: 'Docker', color: 'primary' },
    { id: 2, name: 'Git / GitHub', color: 'warning' },
    { id: 3, name: 'Linux', color: 'success' },
    { id: 4, name: 'macOS Shortcuts', color: 'info' },
    { id: 5, name: 'Windows Shortcuts', color: 'secondary' },
];

const initialCommands: Command[] = [
    // Docker
    { id: 1, title: 'List all containers', command: 'docker ps -a', description: 'Show all containers (running and stopped)', groupId: 1, isFav: true },
    { id: 2, title: 'Start container', command: 'docker start <container_id>', description: 'Start a stopped container', groupId: 1, isFav: false },
    { id: 3, title: 'Stop container', command: 'docker stop <container_id>', description: 'Stop a running container', groupId: 1, isFav: false },
    { id: 4, title: 'Docker Compose Up', command: 'docker-compose up -d', description: 'Start all services in background', groupId: 1, isFav: true },
    { id: 5, title: 'Build image', command: 'docker build -t <image_name> .', description: 'Build image from Dockerfile', groupId: 1, isFav: false },
    { id: 6, title: 'Execute command in container', command: 'docker exec -it <container_id> /bin/bash', description: 'Open bash shell inside container', groupId: 1, isFav: true },
    
    // Git
    { id: 7, title: 'Check status', command: 'git status', description: 'Show working tree status', groupId: 2, isFav: true },
    { id: 8, title: 'Create new branch', command: 'git checkout -b <branch_name>', description: 'Create and switch to new branch', groupId: 2, isFav: false },
    { id: 9, title: 'Push to remote', command: 'git push origin <branch_name>', description: 'Push changes to remote branch', groupId: 2, isFav: false },
    { id: 10, title: 'Pull latest changes', command: 'git pull origin <branch_name>', description: 'Fetch and merge changes from remote', groupId: 2, isFav: true },
    { id: 11, title: 'Stash changes', command: 'git stash', description: 'Temporarily save uncommitted changes', groupId: 2, isFav: false },
    { id: 12, title: 'View commit history', command: 'git log --oneline -10', description: 'Show last 10 commits in one line', groupId: 2, isFav: false },
    
    // Linux
    { id: 13, title: 'List files with details', command: 'ls -la', description: 'List all files including hidden with details', groupId: 3, isFav: true },
    { id: 14, title: 'Find text in files', command: 'grep -r "text" .', description: 'Recursively search for text in current directory', groupId: 3, isFav: true },
    { id: 15, title: 'Change permissions', command: 'chmod 755 <file>', description: 'Set read/write/execute permissions', groupId: 3, isFav: false },
    { id: 16, title: 'Check disk usage', command: 'df -h', description: 'Show disk space usage in human readable format', groupId: 3, isFav: false },
    { id: 17, title: 'Find process by name', command: 'ps aux | grep <process_name>', description: 'Search for running process', groupId: 3, isFav: false },
    { id: 18, title: 'Kill process', command: 'kill -9 <pid>', description: 'Force kill a process by PID', groupId: 3, isFav: false },
    
    // macOS Shortcuts
    { id: 19, title: 'Copy', command: '⌘ + C', description: 'Copy selected item', groupId: 4, isFav: true },
    { id: 20, title: 'Paste', command: '⌘ + V', description: 'Paste from clipboard', groupId: 4, isFav: true },
    { id: 21, title: 'Spotlight Search', command: '⌘ + Space', description: 'Open Spotlight search', groupId: 4, isFav: true },
    { id: 22, title: 'Switch Applications', command: '⌘ + Tab', description: 'Switch between open applications', groupId: 4, isFav: false },
    { id: 23, title: 'Screenshot', command: '⌘ + Shift + 4', description: 'Capture selected area', groupId: 4, isFav: true },
    { id: 24, title: 'Force Quit', command: '⌘ + Option + Esc', description: 'Force quit application', groupId: 4, isFav: false },
    
    // Windows Shortcuts
    { id: 25, title: 'Show Desktop', command: 'Win + D', description: 'Minimize all windows and show desktop', groupId: 5, isFav: true },
    { id: 26, title: 'Task Manager', command: 'Ctrl + Shift + Esc', description: 'Open Task Manager directly', groupId: 5, isFav: true },
    { id: 27, title: 'Switch Windows', command: 'Alt + Tab', description: 'Switch between open windows', groupId: 5, isFav: false },
    { id: 28, title: 'Lock Screen', command: 'Win + L', description: 'Lock your computer', groupId: 5, isFav: true },
    { id: 29, title: 'File Explorer', command: 'Win + E', description: 'Open File Explorer', groupId: 5, isFav: false },
    { id: 30, title: 'Clipboard History', command: 'Win + V', description: 'Open clipboard history panel', groupId: 5, isFav: false },
];

const ComponentsAppsCommands = () => {
    const [commandsList, setCommandsList] = useState<Command[]>(initialCommands);
    const [groupsList, setGroupsList] = useState<Group[]>(initialGroups);
    const [filteredCommands, setFilteredCommands] = useState<Command[]>(initialCommands);
    const [selectedGroup, setSelectedGroup] = useState<string>('all');
    const [searchText, setSearchText] = useState<string>('');
    const [isShowMenu, setIsShowMenu] = useState<boolean>(false);
    
    // Command Modal
    const [isCommandModal, setIsCommandModal] = useState<boolean>(false);
    const [commandParams, setCommandParams] = useState<Partial<Command>>({});
    
    // Group Modal
    const [isGroupModal, setIsGroupModal] = useState<boolean>(false);
    const [groupParams, setGroupParams] = useState<Partial<Group>>({});
    
    // Delete Modal
    const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
    const [deleteItem, setDeleteItem] = useState<{ type: 'command' | 'group'; item: Command | Group } | null>(null);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // Filter commands
    useEffect(() => {
        let filtered = commandsList;
        
        // Filter by group
        if (selectedGroup === 'fav') {
            filtered = filtered.filter((cmd) => cmd.isFav);
        } else if (selectedGroup !== 'all') {
            const groupId = parseInt(selectedGroup);
            filtered = filtered.filter((cmd) => cmd.groupId === groupId);
        }
        
        // Filter by search
        if (searchText) {
            const search = searchText.toLowerCase();
            filtered = filtered.filter(
                (cmd) =>
                    cmd.title.toLowerCase().includes(search) ||
                    cmd.command.toLowerCase().includes(search) ||
                    cmd.description.toLowerCase().includes(search)
            );
        }
        
        setFilteredCommands(filtered);
    }, [selectedGroup, searchText, commandsList]);

    // Toast notification
    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    // Copy to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showMessage('Copied to clipboard!');
    };

    // Toggle favorite
    const toggleFavorite = (cmd: Command) => {
        const updated = commandsList.map((c) => (c.id === cmd.id ? { ...c, isFav: !c.isFav } : c));
        setCommandsList(updated);
    };

    // Command CRUD
    const openCommandModal = (cmd?: Command) => {
        if (cmd) {
            setCommandParams({ ...cmd });
        } else {
            setCommandParams({ id: 0, title: '', command: '', description: '', groupId: groupsList[0]?.id || 1, isFav: false });
        }
        setIsCommandModal(true);
    };

    const saveCommand = () => {
        if (!commandParams.title || !commandParams.command) {
            showMessage('Title and Command are required!', 'error');
            return;
        }

        if (commandParams.id) {
            // Update
            const updated = commandsList.map((c) => (c.id === commandParams.id ? (commandParams as Command) : c));
            setCommandsList(updated);
            showMessage('Command updated successfully!');
        } else {
            // Add
            const maxId = commandsList.reduce((max, c) => (c.id > max ? c.id : max), 0);
            const newCommand: Command = {
                id: maxId + 1,
                title: commandParams.title!,
                command: commandParams.command!,
                description: commandParams.description || '',
                groupId: commandParams.groupId || 1,
                isFav: false,
            };
            setCommandsList([newCommand, ...commandsList]);
            showMessage('Command added successfully!');
        }
        setIsCommandModal(false);
    };

    // Group CRUD
    const openGroupModal = (group?: Group) => {
        if (group) {
            setGroupParams({ ...group });
        } else {
            setGroupParams({ id: 0, name: '', color: 'primary' });
        }
        setIsGroupModal(true);
    };

    const saveGroup = () => {
        if (!groupParams.name) {
            showMessage('Group name is required!', 'error');
            return;
        }

        if (groupParams.id) {
            // Update
            const updated = groupsList.map((g) => (g.id === groupParams.id ? (groupParams as Group) : g));
            setGroupsList(updated);
            showMessage('Group updated successfully!');
        } else {
            // Add
            const maxId = groupsList.reduce((max, g) => (g.id > max ? g.id : max), 0);
            const newGroup: Group = {
                id: maxId + 1,
                name: groupParams.name!,
                color: groupParams.color || 'primary',
            };
            setGroupsList([...groupsList, newGroup]);
            showMessage('Group added successfully!');
        }
        setIsGroupModal(false);
    };

    // Delete
    const confirmDelete = (type: 'command' | 'group', item: Command | Group) => {
        setDeleteItem({ type, item });
        setIsDeleteModal(true);
    };

    const executeDelete = () => {
        if (!deleteItem) return;

        if (deleteItem.type === 'command') {
            setCommandsList(commandsList.filter((c) => c.id !== deleteItem.item.id));
            showMessage('Command deleted successfully!');
        } else {
            // Check if group has commands
            const hasCommands = commandsList.some((c) => c.groupId === deleteItem.item.id);
            if (hasCommands) {
                showMessage('Cannot delete group with commands!', 'error');
                setIsDeleteModal(false);
                return;
            }
            setGroupsList(groupsList.filter((g) => g.id !== deleteItem.item.id));
            showMessage('Group deleted successfully!');
        }
        setIsDeleteModal(false);
        setDeleteItem(null);
    };

    const getGroupColor = (groupId: number) => {
        const group = groupsList.find((g) => g.id === groupId);
        return group?.color || 'primary';
    };

    const getGroupName = (groupId: number) => {
        const group = groupsList.find((g) => g.id === groupId);
        return group?.name || 'Unknown';
    };

    const colorOptions = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];

    return (
        <div>
            <div className="relative flex h-full gap-5 sm:h-[calc(100vh_-_150px)]">
                {/* Overlay for mobile */}
                <div
                    className={`absolute z-10 hidden h-full w-full rounded-md bg-black/60 ${isShowMenu ? '!block xl:!hidden' : ''}`}
                    onClick={() => setIsShowMenu(false)}
                ></div>

                {/* Sidebar */}
                <div
                    className={`panel absolute z-10 hidden h-full w-[240px] flex-none space-y-3 overflow-hidden p-4 ltr:rounded-r-none rtl:rounded-l-none xl:relative xl:block xl:h-auto xl:rounded-r-md ${
                        isShowMenu ? '!block' : ''
                    }`}
                >
                    <div className="flex h-full flex-col pb-16">
                        <div className="flex items-center text-center">
                            <IconCode className="shrink-0" />
                            <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Commands</h3>
                        </div>

                        <div className="my-4 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>

                        <PerfectScrollbar className="relative h-full grow ltr:-mr-3.5 ltr:pr-3.5 rtl:-ml-3.5 rtl:pl-3.5">
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] ${
                                        selectedGroup === 'all' ? 'bg-gray-100 text-primary dark:bg-[#181F32]' : ''
                                    }`}
                                    onClick={() => {
                                        setSelectedGroup('all');
                                        setIsShowMenu(false);
                                    }}
                                >
                                    <IconCode className="shrink-0" />
                                    <span className="ltr:ml-3 rtl:mr-3">All Commands</span>
                                </button>

                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] ${
                                        selectedGroup === 'fav' ? 'bg-gray-100 text-primary dark:bg-[#181F32]' : ''
                                    }`}
                                    onClick={() => {
                                        setSelectedGroup('fav');
                                        setIsShowMenu(false);
                                    }}
                                >
                                    <IconStar className="shrink-0" />
                                    <span className="ltr:ml-3 rtl:mr-3">Favorites</span>
                                </button>

                                <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                                <div className="flex items-center justify-between px-1 py-3">
                                    <span className="text-white-dark">Groups</span>
                                    <button type="button" className="hover:text-primary" onClick={() => openGroupModal()}>
                                        <IconPlus className="h-4 w-4" />
                                    </button>
                                </div>

                                {groupsList.map((group) => (
                                    <div key={group.id} className="group flex items-center">
                                        <button
                                            type="button"
                                            className={`flex h-10 w-full flex-1 items-center rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-${group.color} dark:hover:bg-[#181F32] ${
                                                selectedGroup === String(group.id) ? `bg-gray-100 text-${group.color} dark:bg-[#181F32]` : ''
                                            }`}
                                            onClick={() => {
                                                setSelectedGroup(String(group.id));
                                                setIsShowMenu(false);
                                            }}
                                        >
                                            <IconFolder className={`shrink-0 text-${group.color}`} />
                                            <span className="ltr:ml-3 rtl:mr-3">{group.name}</span>
                                        </button>
                                        <div className="hidden items-center gap-1 group-hover:flex">
                                            <button type="button" className="p-1 hover:text-primary" onClick={() => openGroupModal(group)}>
                                                <IconPencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button type="button" className="p-1 hover:text-danger" onClick={() => confirmDelete('group', group)}>
                                                <IconTrashLines className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </PerfectScrollbar>
                    </div>

                    <div className="absolute bottom-0 w-full p-4 ltr:left-0 rtl:right-0">
                        <button className="btn btn-primary w-full" type="button" onClick={() => openCommandModal()}>
                            <IconPlus className="h-5 w-5 shrink-0 ltr:mr-2 rtl:ml-2" />
                            Add Command
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="panel h-full flex-1 overflow-auto">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-5">
                        <button type="button" className="hover:text-primary xl:hidden" onClick={() => setIsShowMenu(!isShowMenu)}>
                            <IconMenu />
                        </button>

                        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Search commands..."
                                    className="form-input py-2 ltr:pr-11 rtl:pl-11"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                                <button type="button" className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                                    <IconSearch className="mx-auto" />
                                </button>
                            </div>
                        </div>

                        <button type="button" className="btn btn-primary hidden xl:inline-flex" onClick={() => openCommandModal()}>
                            <IconPlus className="ltr:mr-2 rtl:ml-2" />
                            Add Command
                        </button>
                    </div>

                    {filteredCommands.length ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {filteredCommands.map((cmd) => (
                                <div
                                    key={cmd.id}
                                    className={`panel relative h-full border-l-4 border-${getGroupColor(cmd.groupId)} bg-white shadow-md transition-all duration-300 hover:shadow-lg dark:bg-[#1c232f]`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h5 className="text-base font-semibold dark:text-white-light">{cmd.title}</h5>
                                            <span className={`badge badge-outline-${getGroupColor(cmd.groupId)} mt-1`}>{getGroupName(cmd.groupId)}</span>
                                        </div>
                                        <div className="dropdown">
                                            <Dropdown
                                                offset={[0, 5]}
                                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                btnClassName="text-primary"
                                                button={<IconHorizontalDots className="rotate-90 opacity-70 hover:opacity-100" />}
                                            >
                                                <ul className="text-sm font-medium">
                                                    <li>
                                                        <button type="button" onClick={() => openCommandModal(cmd)}>
                                                            <IconPencil className="h-4 w-4 shrink-0 ltr:mr-3 rtl:ml-3" />
                                                            Edit
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" onClick={() => confirmDelete('command', cmd)}>
                                                            <IconTrashLines className="h-4 w-4 shrink-0 ltr:mr-3 rtl:ml-3" />
                                                            Delete
                                                        </button>
                                                    </li>
                                                </ul>
                                            </Dropdown>
                                        </div>
                                    </div>

                                    <div
                                        className="group mt-4 flex cursor-pointer items-center justify-between rounded-md bg-[#f4f4f4] p-3 font-mono text-sm dark:bg-[#0e1726]"
                                        onClick={() => copyToClipboard(cmd.command)}
                                    >
                                        <code className="break-all text-primary">{cmd.command}</code>
                                        <IconCopy className="h-4 w-4 shrink-0 opacity-50 transition-opacity group-hover:opacity-100 ltr:ml-2 rtl:mr-2" />
                                    </div>

                                    {cmd.description && <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{cmd.description}</p>}

                                    <div className="mt-4 flex items-center justify-end">
                                        <button type="button" className="group text-warning" onClick={() => toggleFavorite(cmd)}>
                                            <IconStar className={`h-5 w-5 group-hover:fill-warning ${cmd.isFav ? 'fill-warning' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full min-h-[400px] items-center justify-center text-lg font-semibold sm:min-h-[300px]">
                            No commands found
                        </div>
                    )}
                </div>
            </div>

            {/* Command Modal */}
            <Transition appear show={isCommandModal} as={Fragment}>
                <Dialog as="div" open={isCommandModal} onClose={() => setIsCommandModal(false)} className="relative z-50">
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setIsCommandModal(false)}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {commandParams.id ? 'Edit Command' : 'Add Command'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="mb-5">
                                                <label htmlFor="cmdTitle">Title</label>
                                                <input
                                                    id="cmdTitle"
                                                    type="text"
                                                    placeholder="e.g., List all containers"
                                                    className="form-input"
                                                    value={commandParams.title || ''}
                                                    onChange={(e) => setCommandParams({ ...commandParams, title: e.target.value })}
                                                />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="cmdCommand">Command</label>
                                                <input
                                                    id="cmdCommand"
                                                    type="text"
                                                    placeholder="e.g., docker ps -a"
                                                    className="form-input font-mono"
                                                    value={commandParams.command || ''}
                                                    onChange={(e) => setCommandParams({ ...commandParams, command: e.target.value })}
                                                />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="cmdGroup">Group</label>
                                                <select
                                                    id="cmdGroup"
                                                    className="form-select"
                                                    value={commandParams.groupId || ''}
                                                    onChange={(e) => setCommandParams({ ...commandParams, groupId: parseInt(e.target.value) })}
                                                >
                                                    {groupsList.map((group) => (
                                                        <option key={group.id} value={group.id}>
                                                            {group.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="cmdDescription">Description</label>
                                                <textarea
                                                    id="cmdDescription"
                                                    rows={3}
                                                    className="form-textarea resize-none"
                                                    placeholder="Brief description of the command..."
                                                    value={commandParams.description || ''}
                                                    onChange={(e) => setCommandParams({ ...commandParams, description: e.target.value })}
                                                ></textarea>
                                            </div>
                                            <div className="mt-8 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setIsCommandModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveCommand}>
                                                    {commandParams.id ? 'Update' : 'Add'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Group Modal */}
            <Transition appear show={isGroupModal} as={Fragment}>
                <Dialog as="div" open={isGroupModal} onClose={() => setIsGroupModal(false)} className="relative z-50">
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="panel w-full max-w-md overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setIsGroupModal(false)}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {groupParams.id ? 'Edit Group' : 'Add Group'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="mb-5">
                                                <label htmlFor="groupName">Group Name</label>
                                                <input
                                                    id="groupName"
                                                    type="text"
                                                    placeholder="e.g., Docker, Linux..."
                                                    className="form-input"
                                                    value={groupParams.name || ''}
                                                    onChange={(e) => setGroupParams({ ...groupParams, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="groupColor">Color</label>
                                                <select
                                                    id="groupColor"
                                                    className="form-select"
                                                    value={groupParams.color || 'primary'}
                                                    onChange={(e) => setGroupParams({ ...groupParams, color: e.target.value })}
                                                >
                                                    {colorOptions.map((color) => (
                                                        <option key={color} value={color}>
                                                            {color.charAt(0).toUpperCase() + color.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mt-8 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setIsGroupModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveGroup}>
                                                    {groupParams.id ? 'Update' : 'Add'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Delete Confirmation Modal */}
            <Transition appear show={isDeleteModal} as={Fragment}>
                <Dialog as="div" open={isDeleteModal} onClose={() => setIsDeleteModal(false)} className="relative z-50">
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setIsDeleteModal(false)}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        Delete {deleteItem?.type === 'command' ? 'Command' : 'Group'}
                                    </div>
                                    <div className="p-5 text-center">
                                        <div className="mx-auto w-fit rounded-full bg-danger p-4 text-white ring-4 ring-danger/30">
                                            <IconTrashLines className="mx-auto h-7 w-7" />
                                        </div>
                                        <div className="mx-auto mt-5 sm:w-3/4">
                                            Are you sure you want to delete this {deleteItem?.type}?
                                            {deleteItem?.type === 'group' && (
                                                <p className="mt-2 text-sm text-gray-500">Groups with commands cannot be deleted.</p>
                                            )}
                                        </div>

                                        <div className="mt-8 flex items-center justify-center">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setIsDeleteModal(false)}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={executeDelete}>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ComponentsAppsCommands;
