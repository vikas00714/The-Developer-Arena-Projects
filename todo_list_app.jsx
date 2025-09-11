import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Request notification permission
if (typeof window !== 'undefined' && Notification && Notification.permission !== 'granted') {
  Notification.requestPermission();
}

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Reminder check every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach((task) => {
        if (!task.notified && task.dueDate) {
          const taskTime = new Date(task.dueDate);
          if (taskTime <= now) {
            if (Notification.permission === 'granted') {
              new Notification('⏰ Task Reminder!', {
                body: `${task.text} is due now!`,
              });
            }
            task.notified = true;
            setTasks((prev) => [...prev]);
          }
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [tasks]);

  const addTask = () => {
    if (input.trim()) {
      setTasks([
        ...tasks,
        {
          text: input,
          completed: false,
          category,
          dueDate,
          notified: false,
        },
      ]);
      setInput('');
      setCategory('');
      setDueDate('');
    }
  };

  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const toggleComplete = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditText(tasks[index].text);
  };

  const saveEdit = () => {
    const updatedTasks = [...tasks];
    updatedTasks[editIndex].text = editText;
    setTasks(updatedTasks);
    setEditIndex(null);
    setEditText('');
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTasks(items);
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-white to-blue-50 text-gray-900'} min-h-screen p-6 transition-colors duration-500`}>
      <div className="max-w-xl mx-auto p-6 rounded-2xl shadow-2xl bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-extrabold text-center flex-1 text-blue-700 dark:text-blue-300 tracking-wide">To-Do List</h1>
          <Button
            onClick={() => setDarkMode(!darkMode)}
            className="ml-4 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200"
          >
            {darkMode ? 'Light' : 'Dark'} Mode
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 mb-6">
          <Input
            placeholder="Add a new task..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="shadow-inner border-blue-300 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <Input
            placeholder="Category (e.g., Work, Personal)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="shadow-inner border-blue-300 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <Input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="shadow-inner border-blue-300 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <Button
            onClick={addTask}
            className="transition duration-300 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
          >
            Add
          </Button>
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="taskList">
            {(provided) => (
              <div className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
                {tasks.map((task, index) => (
                  <Draggable key={index} draggableId={`task-${index}`} index={index}>
                    {(provided) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Card className="flex flex-col gap-2 p-4 bg-white dark:bg-gray-700 hover:shadow-xl transition duration-300 border border-gray-100 dark:border-gray-600 rounded-xl">
                          <CardContent className="flex-1">
                            {editIndex === index ? (
                              <Input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full border-blue-300 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                              />
                            ) : (
                              <div>
                                <span className={`text-lg font-medium transition-colors duration-200 ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white'}`}>{task.text}</span>
                                <div className="text-sm mt-1 text-gray-600 dark:text-gray-300">Category: {task.category || 'None'}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : 'Not set'}</div>
                              </div>
                            )}
                          </CardContent>
                          <div className="flex items-center justify-end gap-2">
                            {editIndex === index ? (
                              <Button size="sm" onClick={saveEdit} className="text-green-600 hover:text-green-700">
                                <Check size={16} />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" onClick={() => startEdit(index)} className="hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300">
                                <Pencil size={16} />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => deleteTask(index)} className="hover:bg-red-100 dark:hover:bg-red-800 text-red-500">
                              <Trash2 size={16} />
                            </Button>
                            <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(index)} className="accent-green-500 w-5 h-5 transition-transform hover:scale-110" />
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
