<script>
  import Anchor from "src/partials/Anchor.svelte"
  import {router} from "src/app/util/router"

  export let pubkey
  export let url = ""
  export let value = ""
</script>

{#if url}
  <Anchor
    modal
    stopPropagation
    href={router.at("verifiable-presentation").of(pubkey, {url}).toString()}>
    <i class={`fa fa-circle-info cursor-pointer`} />
  </Anchor>
{:else if value}
  <Anchor
    modal
    stopPropagation
    href={router.at("verifiable-presentation-embedded").of(pubkey, {value}).toString()}>
    <i class={`fa fa-circle-info cursor-pointer`} />
  </Anchor>
{/if}
