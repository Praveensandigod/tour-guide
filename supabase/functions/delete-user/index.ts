
// Import the Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0'

Deno.serve(async (req) => {
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Extract the token
    const token = authHeader.replace('Bearer ', '')
    
    // Create a Supabase client with the auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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
      return new Response(
        JSON.stringify({ error: 'Error getting user', details: getUserError }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Create an admin client to delete the user
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Delete the user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      user.id
    )
    
    if (deleteError) {
      return new Response(
        JSON.stringify({ error: 'Error deleting user', details: deleteError }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ message: 'User deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
