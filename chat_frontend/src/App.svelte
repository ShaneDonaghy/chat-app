<script lang="ts">
    import svelteLogo from './assets/svelte.svg'
    import viteLogo from '/vite.svg'
    import Counter from './lib/Counter.svelte'
    import {Route, Router} from 'svelte-routing';
    import Register from './routes/Register.svelte'
    import Login from './routes/Login.svelte'
    import Chat from './routes/Chat.svelte'
</script>

<Router>
    <Route path="/register" component={Register} />
    <Route path="/login" component={Login} />
    <Route>
        <Chat chatId={null} />
    </Route>
    <Route path="/:id" let:params>
        <Chat chatId={params.id} />
    </Route>
</Router>


<main>
    <h1>Chat</h1>
    <h2>AI Powered Chat App</h2>
</main>

<style>
    .logo {
        height: 6em;
        padding: 1.5em;
        will-change: filter;
        transition: filter 300ms;
    }

    .logo:hover {
        filter: drop-shadow(0 0 2em #646cffaa);
    }

    .logo.svelte:hover {
        filter: drop-shadow(0 0 2em #ff3e00aa);
    }

    .read-the-docs {
        color: #888;
    }
</style>
