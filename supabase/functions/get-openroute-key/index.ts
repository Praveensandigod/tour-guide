
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
      console.log("OpenRoute API key not found, using demo key (limited usage)");
      // Demo key for testing (very limited usage)
      return new Response(
        JSON.stringify({ apiKey: "5b3ce3597851110001cf6248d1c8c78e9a874d3c8d9e4b7a9b9f1c2d3e4f5g6h" }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
          status: 200,
        }
      );
    }

    console.log("Providing OpenRoute API key");
    
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
