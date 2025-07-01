<script lang="ts">
    let name: string = 'John Doe';
    let favouriteColour: string = 'blue';
    const colours: string[] = ['Red', 'Green', 'Blue', 'Yellow'];
</script>

<div>
    <input type="text" bind:value={name}/>
    <select bind:value={favouriteColour}>
        {#each colours as colour}
            <option value={colour}>{colour}</option>
        {/each}
    </select>
</div>
<p>Hello {name}, your favourite colour is {favouriteColour}</p>