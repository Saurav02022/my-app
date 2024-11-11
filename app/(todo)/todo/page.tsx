"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid"; // Import uuid

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export default function ProtectedPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
      } else {
        setUserId(user.id);
        fetchTodos(user.id);
      }
    };

    checkUser();
  }, [router, supabase]);

  const fetchTodos = async (userId: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      setError("Failed to fetch todos. Please try again.");
    } else {
      setTodos(data ?? []);
    }

    setLoading(false);
  };

  const addTodo = async () => {
    if (newTodo.trim() === "" || !userId) return;

    const todoId = uuidv4(); // Generate unique ID for the new todo
    const newTodoItem = {
      id: todoId, // Pass the generated ID
      title: newTodo,
      completed: false,
      user_id: userId,
    };

    setLoading(true);
    setError(null);

    const { data, error, status } = await supabase
      .from("todos")
      .insert([newTodoItem]);

    if (error || status !== 201) {
      setError(
        error
          ? error?.message
          : "An unexpected error occurred. Please try again."
      );
    } else {
      setTodos((prev) => [...prev, newTodoItem]);
      setNewTodo(""); // Clear input
    }

    setLoading(false);
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("todos")
      .update({ completed: !completed })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setError("Failed to update todo. Please try again.");
    } else {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, completed: !completed } : todo
        )
      );
    }

    setLoading(false);
  };

  const deleteTodo = async (id: string) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setError("Failed to delete todo. Please try again.");
    } else {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center gap-6 bg-gray-50 p-5">
      <h1 className="text-4xl font-extrabold mb-6">Todo App</h1>

      <div className="w-full max-w-2xl flex gap-2 mb-8 mx-auto">
        <Input
          type="text"
          placeholder="What needs to be done?"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          disabled={loading}
          onKeyDown={handleKeyDown}
          aria-label="New Todo Input"
        />
        <Button
          onClick={addTodo}
          disabled={newTodo.trim() === "" || loading}
          aria-label="Add Todo Button"
          className="w-20"
        >
          Add
        </Button>
      </div>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {loading ? (
        <div className="w-full min-h-screen flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <ul className="w-full max-w-2xl space-y-4 mx-auto max-h-80 overflow-auto">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center p-5 bg-white rounded-md shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out"
            >
              <Input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
                className="size-5 mr-3 cursor-pointer"
                aria-label={`Toggle completion for ${todo.title}`}
              />
              <span
                className={`flex-1 line-clamp-2 ${
                  todo.completed
                    ? "line-through text-gray-500"
                    : "text-gray-800"
                }`}
              >
                {todo.title}
              </span>
              <Button
                onClick={() => deleteTodo(todo.id)}
                aria-label={`Delete ${todo.title}`}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
