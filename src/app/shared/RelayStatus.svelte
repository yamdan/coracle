<script lang="ts">
  import {poll} from "hurdak"
  import {onMount} from "svelte"
  import {ctx} from "@welshman/lib"

  export let url

  let statusHover = false
  let description = "Not connected"
  let status = "closed"

  onMount(() => {
    return poll(3000, () => {
      const cxn = ctx.net.pool.get(url, {autoConnect: false})

      if (cxn) {
        description = cxn.meta.getDescription()
        status = cxn.meta.getStatus()
      }
    })
  })
</script>

<span
  on:mouseout={() => {
    statusHover = false
  }}
  on:mouseover={() => {
    statusHover = true
  }}
  class="h-2 w-2 cursor-pointer rounded-full bg-neutral-600"
  class:bg-neutral-600={["closed"].includes(status)}
  class:bg-danger={["unauthorized", "forbidden", "error"].includes(status)}
  class:bg-warning={["slow"].includes(status)}
  class:bg-success={["ok"].includes(status)} />
<p
  class="hidden text-sm text-neutral-100 transition-all sm:block"
  class:opacity-0={!statusHover}
  class:opacity-1={statusHover}>
  {description}
</p>
