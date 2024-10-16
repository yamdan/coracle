<script lang="ts">
  import {deriveVerifiedProfile} from "src/engine"
  import Spinner from "src/partials/Spinner.svelte"
  import {fly} from "src/util/transition"

  export let pubkey = ''

  $: profileVpPromise = deriveVerifiedProfile(pubkey)
</script>

{#await $profileVpPromise}
  <Spinner />
{:then profileVP}
  {#if profileVP}
    <div in:fly={{y: 20}}>
      <h1 class="staatliches text-2xl">Verified Profile</h1>

      <h2 class="staatliches text-xl">Verification Result</h2>
      {#if profileVP.result}
        <i class="fa fa-check" />
        <span>success</span>
      {:else}
        <i class="fa fa-times text-red-500" />
        <span>failed ({profileVP.error})</span>
      {/if}

      <h2 class="staatliches text-xl">Holder ID</h2>
      <span>{profileVP.metadata.holder} <i class="fa fa-at" /> {profileVP.metadata.domain}</span>

      <h2 class="staatliches text-xl">Nostr Public Key</h2>
      <span>{pubkey}</span>

      <h2 class="staatliches text-xl">Challenge (Signed Value)</h2>
      <span>{profileVP.metadata.challenge}</span>

      {#if profileVP.metadata.boundVCs && profileVP.metadata.boundVCs.length > 0}
        {#each profileVP.metadata.boundVCs as vc, i}
          <h2 class="staatliches text-xl">Bound VC [{i + 1}]</h2>
          <pre><code>{JSON.stringify(vc, null, 2)}</code></pre>
        {/each}
      {/if}

      {#if profileVP.metadata.unboundVCs && profileVP.metadata.unboundVCs.length > 0}
        {#each profileVP.metadata.unboundVCs as vc, i}
          <h2 class="staatliches text-xl">Unbound VC [{i + 1}]</h2>
          <pre><code>{JSON.stringify(vc, null, 2)}</code></pre>
        {/each}
      {/if}

      <h2 class="staatliches text-xl">Complete Profile VP</h2>
      <pre><code>{profileVP ? JSON.stringify(profileVP.vp, null, 2) : ""}</code></pre>
    </div>
  {/if}
{/await}
