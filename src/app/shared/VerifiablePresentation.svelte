<script>
  import Anchor from "src/partials/Anchor.svelte"
  import {router} from "src/app/util/router"

  export let url
  export let pubkey
</script>

<Anchor 
  modal
  stopPropagation
  href={router.at("media").of(url).toString()}>
  <span>🖊️</span>
</Anchor>
