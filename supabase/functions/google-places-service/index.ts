
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, placeId, origin, destination, language = 'en' } = await req.json();
    
    // Get API key
    let apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      apiKey = "AIzaSyC1i61ye2wNUdmOoKlM2mvi9LI0m9vL7xE";
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let result = {};

    switch (action) {
      case 'search_places':
        // Text search for places
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&fields=place_id,name,formatted_address,geometry,rating,photos,types,business_status`;
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (searchData.status === 'OK') {
          // Cache results in database
          for (const place of searchData.results) {
            const { error } = await supabase
              .from('google_places')
              .upsert({
                place_id: place.place_id,
                name: place.name,
                formatted_address: place.formatted_address,
                rating: place.rating || 0,
                photos: place.photos ? place.photos.map(p => p.photo_reference) : [],
                geometry_lat: place.geometry?.location?.lat,
                geometry_lng: place.geometry?.location?.lng,
                place_types: place.types || [],
                updated_at: new Date().toISOString()
              }, { onConflict: 'place_id' });
            
            if (error) console.error('Error caching place:', error);
          }
          
          result = {
            results: searchData.results.map(place => ({
              place_id: place.place_id,
              name: place.name,
              formatted_address: place.formatted_address,
              rating: place.rating || 0,
              geometry: place.geometry,
              photos: place.photos || [],
              types: place.types || []
            })),
            status: 'OK'
          };
        } else {
          result = { results: [], status: searchData.status, error: searchData.error_message };
        }
        break;

      case 'place_details':
        // Get detailed information about a specific place
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=name,formatted_address,geometry,rating,photos,types,website,opening_hours,reviews,international_phone_number`;
        
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        if (detailsData.status === 'OK') {
          // Cache in database
          await supabase
            .from('google_places')
            .upsert({
              place_id: placeId,
              name: detailsData.result.name,
              formatted_address: detailsData.result.formatted_address,
              rating: detailsData.result.rating || 0,
              photos: detailsData.result.photos ? detailsData.result.photos.map(p => p.photo_reference) : [],
              geometry_lat: detailsData.result.geometry?.location?.lat,
              geometry_lng: detailsData.result.geometry?.location?.lng,
              place_types: detailsData.result.types || [],
              website: detailsData.result.website,
              opening_hours: detailsData.result.opening_hours ? JSON.stringify(detailsData.result.opening_hours) : null,
              updated_at: new Date().toISOString()
            }, { onConflict: 'place_id' });
          
          result = detailsData.result;
        } else {
          result = { error: detailsData.error_message, status: detailsData.status };
        }
        break;

      case 'get_directions':
        // Get directions between two points
        const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}&language=${language}`;
        
        const directionsResponse = await fetch(directionsUrl);
        const directionsData = await directionsResponse.json();
        
        result = directionsData;
        break;

      case 'get_photo':
        // Get photo URL
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${query}&key=${apiKey}`;
        result = { photo_url: photoUrl };
        break;

      case 'autocomplete':
        // Place autocomplete
        const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&types=establishment|tourist_attraction&components=country:in`;
        
        const autocompleteResponse = await fetch(autocompleteUrl);
        const autocompleteData = await autocompleteResponse.json();
        
        result = autocompleteData;
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in Google Places service:", error);
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
