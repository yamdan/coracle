<script lang="ts">
  import {onMount} from "svelte"
  import {fly} from "src/util/transition"
  import Spinner from "src/partials/Spinner.svelte"
  import {defer} from "hurdak"
  import {verifyEmbeddedVP, verifyRemoteVP} from "src/util/verification/verify"
  import type {VerifiedVP} from "src/util/verification/types/VCVP"
  import {deriveVerifiedProfile} from "src/engine"
  import {DOMAIN_FOR_PPID} from "src/util/verification"
  import Anchor from "src/partials/Anchor.svelte"
  import {router} from "src/app/util"

  export let pubkey
  export let url = ""
  export let value = ""

  let messageVpPromise: Promise<VerifiedVP> = defer()
  $: profileVpPromise = deriveVerifiedProfile(pubkey)

  onMount(async () => {
    if (url) {
      messageVpPromise = verifyRemoteVP(url, {challenge: pubkey, domain: DOMAIN_FOR_PPID})
    } else {
      messageVpPromise = verifyEmbeddedVP(value, {challenge: pubkey, domain: DOMAIN_FOR_PPID})
    }
  })

  const validateMessageVP = (messageVP, profileVP) => {
    if (typeof messageVP !== "object" || typeof profileVP !== "object")
      return {
        result: false,
        error: "Invalid VP",
      }
    if (!messageVP || !profileVP)
      return {
        result: false,
        error: "Invalid VP",
      }
    if (messageVP.result !== true)
      return {
        result: false,
        error: `Invalid message VP: ${messageVP.error}`,
      }
    if (profileVP.result !== true)
      return {
        result: false,
        error: `Invalid profile VP: ${profileVP.error}`,
      }
    if (messageVP.metadata.holder !== profileVP.metadata.holder) {
      return {
        result: false,
        error: "Message VP holder does not match profile VP holder",
      }
    }
    return {
      result: true,
    }
  }
</script>

{#await messageVpPromise}
  <Spinner />
{:then messageVP}
  {#await $profileVpPromise}
    <Spinner />
  {:then profileVP}
    {#if !messageVP}
      <p class="text-center">Failed to load message VP</p>
    {:else if !profileVP}
      <p class="text-center">Failed to load profile VP</p>
    {:else}
      {@const validated = validateMessageVP(messageVP, profileVP)}
      <div in:fly={{y: 20}}>
        {#if url}
          <h1 class="staatliches text-2xl">
            Linked Verifiable Presentation
            <Anchor underline external externalHref={url}>(data source)</Anchor>
          </h1>
        {:else}
          <h1 class="staatliches text-2xl">Embedded Verifiable Presentation</h1>
        {/if}

        <h2 class="staatliches text-xl">Verification Result</h2>
        {#if validated.result}
          <i class="fa fa-check" />
          <span>success</span>
        {:else}
          <i class="fa fa-times text-red-500" />
          <span>failed ({validated.error})</span>
        {/if}

        <h2 class="staatliches text-xl">Holder ID</h2>
        <span>{messageVP.metadata.holder} <i class="fa fa-at" /> {messageVP.metadata.domain}</span>

        <h2 class="staatliches text-xl">Nostr Public Key</h2>
        <span>{pubkey}</span>

        <h2 class="staatliches text-xl">Challenge (Signed Value)</h2>
        <span>{messageVP.metadata.challenge}</span>

        {#if messageVP.metadata.boundVCs && messageVP.metadata.boundVCs.length > 0}
          {#each messageVP.metadata.boundVCs as vc, i}
            <h2 class="staatliches text-xl">Bound VC [{i + 1}]</h2>
            <pre><code>{JSON.stringify(vc, null, 2)}</code></pre>
          {/each}
        {/if}

        {#if messageVP.metadata.unboundVCs && messageVP.metadata.unboundVCs.length > 0}
          {#each messageVP.metadata.unboundVCs as vc, i}
            <h2 class="staatliches text-xl">Unbound VC [{i + 1}]</h2>
            <pre><code>{JSON.stringify(vc, null, 2)}</code></pre>
          {/each}
        {/if}

        <h2 class="staatliches text-xl">Complete Message VP</h2>
        <pre><code>{messageVP ? JSON.stringify(messageVP.vp, null, 2) : ""}</code></pre>

        <h2 class="staatliches text-xl">Profile VP used for verification</h2>
        <Anchor modal underline href={router.at("verifiable-profile").of(pubkey).toString()}>
          here
        </Anchor>
      </div>
    {/if}
  {/await}
{/await}
