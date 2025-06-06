
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
    // Get Foursquare API key from environment
    const apiKey = Deno.env.get("FOURSQUARE_API_KEY");
    
    if (!apiKey) {
      console.log("Foursquare API key not found in environment, using provided key");
      // Using your provided API key
      return new Response(
        JSON.stringify({ apiKey: "fsq3ZQ214FTWR46oluj4T5lE3FK0lQjU+kancYbVa3hLZY4=" }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
          status: 200,
        }
      );
    }

    console.log("Providing Foursquare API key from environment");
    
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
    console.error("Error getting Foursquare API key:", error);
    
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
