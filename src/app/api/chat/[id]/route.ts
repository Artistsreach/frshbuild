import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/actions/get-auth-token";

// Simple in-memory message storage (in production, use a proper database)
const messageStore = new Map<string, any[]>();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authToken = await getAuthToken(request);
    
    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { parts } = body;

    if (!parts || !Array.isArray(parts)) {
      return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
    }

    // Get existing messages for this app
    const messages = messageStore.get(id) || [];
    
    // Create a new message
    const newMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts,
      createdAt: new Date().toISOString(),
    };

    // Add user message
    messages.push(newMessage);

    // Create a simple AI response (in a real app, this would call the AI model)
    const aiResponse = {
      id: crypto.randomUUID(),
      role: "assistant",
      parts: [
        {
          type: "text",
          text: `I received your message: "${parts.find(p => p.type === 'text')?.text || 'No text content'}"\n\nThis is a placeholder response. In a full implementation, this would integrate with Freestyle MCP tools to build your app.`,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    // Add AI response
    messages.push(aiResponse);

    // Store updated messages
    messageStore.set(id, messages);

    return NextResponse.json({ 
      success: true, 
      message: "Message processed",
      messages: messages 
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authToken = await getAuthToken(request);
    
    if (!authToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Return existing messages for this app
    const messages = messageStore.get(id) || [];
    
    return NextResponse.json({ 
      success: true, 
      messages 
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
