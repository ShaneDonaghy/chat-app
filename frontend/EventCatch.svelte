<script lang="ts">
    import EventDispatch from "./EventDispatch.svelte";

    function handleReset() {
        console.log('Counter was Reset');
    }
</script>
<main>
    <EventDispatch on:reset={handleReset}/>
</main>