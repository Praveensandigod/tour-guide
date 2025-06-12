
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Return the working Mapbox API key
    const apiKey = "pk.eyJ1IjoieHl6MDciLCJhIjoiY21idGJzaDMzMDI0eTJsczNsOGVpbGwxbCJ9.rbNS5-bM71ebVtFNkfYRqA";
    
    console.log(`Providing Mapbox API key`);
    
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
    console.error("Error getting Mapbox API key:", error);
    
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
