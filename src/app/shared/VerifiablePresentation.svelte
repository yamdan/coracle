<script>
  import Anchor from "src/partials/Anchor.svelte"
  import {router} from "src/app/util/router"

  export let pubkey
  export let url
</script>

<Anchor modal stopPropagation href={router.at("verifiable-presentation").of(pubkey, {url}).toString()}>
  <i class={`fa fa-circle-info cursor-pointer`} />
</Anchor>
