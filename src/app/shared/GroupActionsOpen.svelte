<script lang="ts">
  import {remove} from "@welshman/lib"
  import {session, pubkey} from "@welshman/app"
  import Popover from "src/partials/Popover.svelte"
  import OverflowMenu from "src/partials/OverflowMenu.svelte"
  import {router} from "src/app/util/router"
  import {
    publishCommunitiesList,
    deriveGroup,
    deriveGroupStatus,
    deriveAdminKeyForGroup,
    getUserCommunities,
  } from "src/engine"

  export let address

  const group = deriveGroup(address)
  const adminKey = deriveAdminKeyForGroup(address)
  const status = deriveGroupStatus(address)

  let actions = []

  $: {
    actions = []

    actions.push({
      onClick: () => router.at("invite/create").qp({initialGroupAddress: address}).open(),
      label: "Share",
      icon: "share-nodes",
    })

    if ($group.pubkey === $pubkey || $adminKey) {
      actions.push({
        onClick: () => router.at("groups").of(address).at("edit").open(),
        label: "Edit",
        icon: "edit",
      })

      actions.push({
        onClick: () => router.at("groups").of(address).at("delete").open(),
        label: "Delete",
        icon: "trash",
      })
    }

    actions.push({
      onClick: () => router.at("groups").of(address).at("info").open(),
      label: "Details",
      icon: "info",
    })
  }

  const join = () => publishCommunitiesList(getUserCommunities(session.get()).concat(address))

  const leave = () => publishCommunitiesList(remove(address, getUserCommunities(session.get())))
</script>

<button type="button" class="flex items-center gap-3" on:click|stopPropagation>
  {#if $session}
    {#if $status.joined}
      <Popover triggerType="mouseenter">
        <div slot="trigger" class="w-6 text-center">
          <i class="fa fa-right-from-bracket cursor-pointer" on:click={leave} />
        </div>
        <div slot="tooltip">Leave</div>
      </Popover>
    {:else}
      <Popover triggerType="mouseenter">
        <div slot="trigger" class="w-6 text-center">
          <i class="fa fa-right-to-bracket cursor-pointer" on:click={join} />
        </div>
        <div slot="tooltip">Join</div>
      </Popover>
    {/if}
  {/if}
  <OverflowMenu {actions} />
</button>
