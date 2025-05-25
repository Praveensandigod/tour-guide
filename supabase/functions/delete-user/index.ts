
// Import the Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Extract the token
    const token = authHeader.replace('Bearer ', '')
    
    // Create a Supabase client with the auth token to get user info
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )
    
    // Get the current user
    const { data: { user }, error: getUserError } = await supabaseClient.auth.getUser()
    
    if (getUserError || !user) {
      console.error('Error getting user:', getUserError)
      return new Response(
        JSON.stringify({ error: 'Error getting user', details: getUserError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('Deleting user:', user.id)
    
    // First call the database function to delete user data
    const { error: dbDeleteError } = await supabaseClient.rpc('delete_user')
    
    if (dbDeleteError) {
      console.error('Error deleting user data:', dbDeleteError)
      return new Response(
        JSON.stringify({ error: 'Error deleting user data', details: dbDeleteError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Create an admin client to delete the user from auth.users
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Delete the user from auth.users
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    
    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Error deleting user', details: deleteError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('User deleted successfully:', user.id)
    
    return new Response(
      JSON.stringify({ message: 'User deleted successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Internal server error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
