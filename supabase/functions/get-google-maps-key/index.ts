
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Get the API key from environment variable or use the provided key
    let apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    
    // If not set in environment, use the provided key
    if (!apiKey) {
      apiKey = "AIzaSyC1i61ye2wNUdmOoKlM2mvi9LI0m9vL7xE";
    }
    
    if (!apiKey) {
      throw new Error("API key not configured");
    }
    
    // Create a masked version for logging (only showing last 4 chars)
    const maskedKey = apiKey.substring(0, apiKey.length - 4).replace(/./g, '*') + 
                      apiKey.substring(apiKey.length - 4);
    console.log(`Providing Google Maps API key: ${maskedKey}`);
    
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
    console.error("Error getting Google Maps API key:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
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
