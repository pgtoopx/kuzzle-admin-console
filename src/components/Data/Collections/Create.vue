<template>
  <div v-if="hasRights">
    <create-or-update
      headline="Create a new collection"
      :error="error"
      :index="index"
      @collection-create::create="create"
      @collection-create::reset-error="error = ''"
      @document-create::error="setError"
    />
  </div>
  <div v-else>
    <page-not-allowed />
  </div>
</template>

<script>
import { canCreateCollection } from '../../../services/userAuthorization'
import PageNotAllowed from '../../Common/PageNotAllowed'
import CreateOrUpdate from './CreateOrUpdate'

export default {
  name: 'CollectionCreate',
  components: {
    CreateOrUpdate,
    PageNotAllowed
  },
  props: {
    index: String
  },
  data() {
    return {
      error: ''
    }
  },
  computed: {
    hasRights() {
      return canCreateCollection(this.index, this.collection)
    }
  },
  mounted() {
    this.$store.direct.commit.collection.resetCollectionDetail()
  },
  methods: {
    create() {
      this.error = ''

      this.$store.direct.dispatch.index
        .createCollectionInIndex({
          index: this.index,
          collection: this.$store.state.collection.name,
          isRealtimeOnly: this.$store.state.collection.isRealtimeOnly
        })
        .then(() => {
          this.$router.push({
            name: 'DataIndexSummary',
            params: { index: this.index }
          })
        })
        .catch(e => {
          this.error = e.message
        })
    },
    setError(payload) {
      this.error = payload
    }
  }
}
</script>
