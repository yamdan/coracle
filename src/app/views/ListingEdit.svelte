<script lang="ts">
  import {Tags, asStampedEvent} from "@welshman/util"
  import {sleep, ucFirst} from "hurdak"
  import {inc} from "ramda"
  import {getCurrencyOption} from "src/util/i18n"
  import FlexColumn from "src/partials/FlexColumn.svelte"
  import Anchor from "src/partials/Anchor.svelte"
  import Spinner from "src/partials/Spinner.svelte"
  import Field from "src/partials/Field.svelte"
  import FieldInline from "src/partials/FieldInline.svelte"
  import Input from "src/partials/Input.svelte"
  import CurrencySymbol from "src/partials/CurrencySymbol.svelte"
  import CurrencyInput from "src/partials/CurrencyInput.svelte"
  import SelectButton from "src/partials/SelectButton.svelte"
  import ImageInput from "src/partials/ImageInput.svelte"
  import NoteImages from "src/app/shared/NoteImages.svelte"
  import Compose from "src/app/shared/Compose.svelte"
  import {router} from "src/app/util/router"
  import {deriveEvent, publishToZeroOrMoreGroups} from "src/engine"

  export let address

  const event = deriveEvent(address)

  const onSubmit = async () => {
    const tags = Tags.fromEvent($event)
      .setTag("title", values.title)
      .setTag("summary", values.summary)
      .setTag("location", values.location)
      .setTag("price", values.price.toString(), values.currency.code)
      .setTag("status", values.status)
      .setImages(images.getValue())
      .removeContext()

    const template = asStampedEvent({
      ...$event,
      tags: tags.unwrap(),
      content: compose.parse(),
      created_at: inc($event.created_at),
    })

    publishToZeroOrMoreGroups(values.groups, template)
    router.pop()
  }

  let loading = true
  let images, compose
  let values: any = {}

  $: {
    if ($event && loading) {
      const tags = Tags.fromEvent($event)
      const [price, code] = tags.whereKey("price").first().slice(1).valueOf()

      loading = false

      values = {
        groups: tags.context().values().valueOf(),
        title: tags.get("title")?.value() || "",
        summary: tags.get("summary")?.value() || "",
        location: tags.get("location")?.value() || "",
        status: tags.get("status")?.value() || "active",
        price: parseInt(price || "0"),
        currency: getCurrencyOption(code),
      }

      // Wait for components to mount
      sleep(10).then(() => {
        compose.write($event.content)

        for (const url of tags.values("image").valueOf()) {
          images.addImage(Tags.wrap([["url", url]]))
        }
      })
    }
  }
</script>

{#if loading}
  <Spinner />
{:else}
  <form on:submit|preventDefault={() => onSubmit()}>
    <FlexColumn>
      <Field label="Title">
        <Input bind:value={values.title} />
      </Field>
      <Field label="Summary">
        <Input bind:value={values.summary} />
      </Field>
      <Field label="Price">
        <div class="grid grid-cols-3 gap-2">
          <div class="col-span-2">
            <Input type="number" placeholder="0" bind:value={values.price}>
              <span slot="before">
                <CurrencySymbol code={values.currency?.code || "SAT"} />
              </span>
            </Input>
          </div>
          <div class="relative">
            <CurrencyInput bind:value={values.currency} />
          </div>
        </div>
      </Field>
      <Field label="Location (optional)">
        <Input bind:value={values.location} />
      </Field>
      <Field label="Description">
        <div class="rounded-xl border border-solid border-neutral-600 bg-white p-3 text-black">
          <Compose autofocus bind:this={compose} {onSubmit} />
        </div>
      </Field>
      <NoteImages bind:this={images} bind:compose />
      <FieldInline label="Status">
        <SelectButton
          bind:value={values.status}
          options={["active", "sold"]}
          displayOption={ucFirst} />
      </FieldInline>
      <div class="flex gap-2">
        <Anchor button tag="button" type="submit" class="flex-grow">Save</Anchor>
        <ImageInput multi hostLimit={3} on:change={e => images?.addImage(e.detail)} />
      </div>
    </FlexColumn>
  </form>
{/if}
