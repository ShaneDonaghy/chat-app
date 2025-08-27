<script lang="ts">
    import {onMount} from 'svelte';
    import {navigate} from 'svelte-routing';
    import '../styles/chat.css';
    import {authToken} from '../stores/auth';
    import ChatListsSideBar from '../components/ChatListSideBar.svelte';
    import ChatDetails from '../components/ChatDetails.svelte';
    import Header from '../components/Header.svelte';

    export let chatId: string | null; // allows it to be passed as prop

    onMount(() => {
        if (!$authToken) {
            navigate("/register");
        }
    });
</script>
<div>
    <Header></Header>
    <div class="container">
        <div class="chat-list-container">
            <ChatListsSideBar chatId={chatId}/>
        </div>
        <div class="chat-container">
            {#if chatId}
                <ChatDetails chatId={chatId}/>
            {/if}
        </div>
    </div>
</div>