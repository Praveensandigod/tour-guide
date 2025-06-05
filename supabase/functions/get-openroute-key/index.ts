
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get OpenRoute Service API key from environment
    const apiKey = Deno.env.get("OPENROUTE_API_KEY");
    
    if (!apiKey) {
      console.log("OpenRoute API key not found in environment, using provided key");
      // Using your provided API key
      return new Response(
        JSON.stringify({ apiKey: "5b3ce3597851110001cf6248953e793ca59140e9b20953797ecb4f89" }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
          status: 200,
        }
      );
    }

    console.log("Providing OpenRoute API key from environment");
    
    return new Response(
      JSON.stringify({ apiKey }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error getting OpenRoute API key:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to get API key" }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 500,
      }
    );
  }
});
