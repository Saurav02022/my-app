import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Helper function to get current user ID
async function getUserId(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? user.id : null;
}

// Create a new to-do
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const userId = await getUserId(supabase);

    if (!userId) return NextResponse.redirect("/sign-in");

    const { title } = await request.json().catch(() => ({ title: "" }));
    if (!title)
      return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const { data, error } = await supabase
      .from("todos")
      .insert({ title, user_id: userId, completed: false });

    if (error) return NextResponse.error();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.error();
  }
}

// Fetch to-do items
export async function GET() {
  try {
    const supabase = await createClient();
    const userId = await getUserId(supabase);

    if (!userId) return NextResponse.redirect("/sign-in");

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId);

    if (error) return NextResponse.error();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.error();
  }
}

// Update a to-do item
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const userId = await getUserId(supabase);

    if (!userId) return NextResponse.redirect("/sign-in");

    const { id, title, completed } = await request.json().catch(() => ({}));
    if (!id)
      return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const { data, error } = await supabase
      .from("todos")
      .update({ title, completed })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return NextResponse.error();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating todo:", error);
    return NextResponse.error();
  }
}

// Delete a to-do item
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const userId = await getUserId(supabase);

    if (!userId) return NextResponse.redirect("/sign-in");

    const { id } = await request.json().catch(() => ({}));
    if (!id)
      return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return NextResponse.error();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.error();
  }
}
