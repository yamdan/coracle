<script lang="ts">
  import {isShareableRelayUrl} from "@welshman/util"
  import {displayUrl} from "src/util/misc"
  import Anchor from "src/partials/Anchor.svelte"
  import Media from "src/partials/Media.svelte"
  import {router} from "src/app/util/router"
  import VerifiablePresentation from "src/app/shared/VerifiablePresentation.svelte"
  
  export let value
  export let showMedia = false
  export let pubkey

  const url = value.url.toString()

  const coracleRegexp = /^(https?:\/\/)?(app\.)?coracle.social/
  const verifiablePresentationRegexp = /#verifiable-presentation$/
  const verifiableProfileRegexp = /#verifiable-profile$/

  const close = () => {
    hidden = true
  }

  let hidden = false
</script>

{#if url.match(verifiablePresentationRegexp)}
  <VerifiablePresentation {pubkey} {url} />
{:else if url.match(verifiableProfileRegexp)}
  {''}
{:else if url.match(coracleRegexp)}
  <Anchor
    modal
    stopPropagation
    class="overflow-hidden text-ellipsis whitespace-nowrap underline"
    href={url.replace(coracleRegexp, '')}>
    {displayUrl(url)}
  </Anchor>
{:else if showMedia && !hidden}
  <Media url={url} onClose={close} />
{:else if isShareableRelayUrl(url)}
  <Anchor
    modal
    stopPropagation
    class="overflow-hidden text-ellipsis whitespace-nowrap underline"
    href={router.at("relays").of(url).toString()}>
    {displayUrl(url)}
  </Anchor>
{:else}
  <Anchor
    modal
    stopPropagation
    class="overflow-hidden text-ellipsis whitespace-nowrap underline"
    externalHref={url}
    href={router.at("media").of(url).toString()}>
    {displayUrl(url)}
  </Anchor>
{/if}
