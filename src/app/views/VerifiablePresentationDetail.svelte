<script lang="ts">
  import {onMount} from "svelte"
  import {fly} from "src/util/transition"
  import Spinner from "src/partials/Spinner.svelte"
  import {defer} from "hurdak"
  import {verifyRemoteVP} from "src/util/verification/verify"
  import type {VerifiedVP} from "src/util/verification/types/VCVP"

  export let pubkey
  export let url

  let verifiedProfile: Promise<VerifiedVP> = defer()

  onMount(async () => {
    verifiedProfile = verifyRemoteVP(url, pubkey)
  })
</script>

{#await verifiedProfile}
  <Spinner />
{:then vp}
  {#if vp}
    <div in:fly={{y: 20}}>
      <h1 class="staatliches text-2xl">Verifiable Presentation</h1>
      <h2 class="staatliches text-xl">Verification Result</h2>
      {#if vp.result}
        <i class="fa fa-check" />
        <span>success</span>
      {:else}
        <i class="fa fa-times text-red-500" />
        <span>failed ({vp.error})</span>
      {/if}
      <h2 class="staatliches text-xl">Nostr Public Key</h2>
      <span>{pubkey}</span>
      <h2 class="staatliches text-xl">Challenge (Signed Value)</h2>
      <span>{vp.metadata.challenge}</span>
      <h2 class="staatliches text-xl">PPID</h2>
      <code>{vp.metadata.holder} @ {vp.metadata.domain}</code>
      <h2 class="staatliches text-xl">Details</h2>
      <pre><code>{vp ? JSON.stringify(vp.vp, null, 2) : ""}</code></pre>
    </div>
  {:else}
    <p class="text-center">Failed to load verifiable presentation.</p>
  {/if}
{/await}
