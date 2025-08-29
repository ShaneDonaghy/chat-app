<script lang="ts">
    import {Route, Router} from 'svelte-routing';
    import Register from './routes/Register.svelte'
    import Login from './routes/Login.svelte'
    import Chat from './routes/Chat.svelte'
</script>

<Router>
    <Route path="/register"><Register /></Route>
    <Route path="/login"><Login /></Route>
    <Route><Chat chatId={null}/></Route>
    <Route><Chat chatId={null}/></Route>
    <Route path="/:id" let:params>
        <Chat chatId={params.id}/>
    </Route>
</Router>

<main>
    <h1>Chat</h1>
    <h2>AI Powered Chat App</h2>
</main>
