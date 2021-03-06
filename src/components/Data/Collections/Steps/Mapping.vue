<template>
  <form class="Mapping wrapper" @submit.prevent="next">
    <!-- Required fields -->
    <div v-if="!$route.params.collection">
      <div class="row">
        <!-- Collection name -->
        <div class="col s6">
          <div class="Mapping-name input-field">
            <input
              id="collection-name"
              v-focus
              type="text"
              name="collection"
              required
              class="validate"
              tabindex="1"
              :value="$store.state.collection.name"
              @input="setName"
            />
            <label for="collection-name">Collection name</label>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="divider" />
      </div>
    </div>

    <!-- Settings (mappings, realtime only ...) -->
    <div class="row">
      <div class="col s12">
        <div class="row">
          <p class="Mapping-realtimeOnly">
            <label>
              <input
                id="realtime-collection"
                type="checkbox"
                class="filled-in"
                tabindex="3"
                :checked="collectionIsRealtimeOnly"
                @change="setRealtimeOnly"
              />
              <span>
                Real-time only
              </span>
            </label>
          </p>
        </div>
      </div>

      <div v-show="!collectionIsRealtimeOnly" class="col s8">
        <div class="row">
          <p>Mapping:</p>
          <json-editor
            id="collection"
            ref="jsoneditor"
            tabindex="4"
            myclass="pre_ace"
            :content="$store.state.collection.mapping"
          />
        </div>
      </div>

      <div v-show="!collectionIsRealtimeOnly" class="col s4">
        <div class="row">
          <div class="help">
            Mapping is the process of defining how a document, and the fields it
            contains, are stored and indexed.
            <a
              href="https://docs.kuzzle.io/api/1/controller-collection/update-mapping/"
              target="_blank"
              >Read more about mapping</a
            >
            <br />
            You should omit the root "properties" field in this form.
            <pre>
{
  "age": { "type": "integer" },
  "name": { "type": "text" }
}
            </pre>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="divider" />
    </div>

    <!-- Actions -->
    <div class="row">
      <div class="col s12">
        <a tabindex="6" class="btn-flat waves-effect" @click.prevent="cancel"
          >Cancel</a
        >
        <button
          type="submit"
          class="Mapping-submitBtn btn primary waves-effect waves-light"
        >
          {{ collectionIsRealtimeOnly ? 'Save' : 'Next' }}
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import JsonEditor from '../../../Common/JsonEditor'
import focus from '../../../../directives/focus.directive'

export default {
  name: 'Mapping',
  components: {
    JsonEditor
  },
  directives: {
    focus
  },
  props: {
    step: Number
  },
  data() {
    return {
      isRealtimeOnly: false,
      settingsOpen: false
    }
  },
  computed: {
    collectionIsRealtimeOnly() {
      return this.$store.direct.getters.collection.isRealtimeOnly
    }
  },
  watch: {
    step() {
      let mapping = this.$refs.jsoneditor.getJson()
      if (mapping) {
        this.$store.direct.commit.collection.setMapping(mapping)
      }
    }
  },
  methods: {
    setName(e) {
      this.$store.direct.commit.collection.setCollectionName(
        e.target.value.trim()
      )
    },
    next() {
      if (!this.$store.direct.state.collection.name) {
        return this.$emit('collection-create::error', 'Invalid collection name')
      }
      if (this.collectionIsRealtimeOnly) {
        this.$emit('collection-create::create')
      } else {
        this.$emit('collection-create::next-step')
      }
    },
    cancel() {
      this.$emit('cancel')
    },
    setRealtimeOnly(event) {
      this.$store.direct.commit.collection.setRealtimeOnly(event.target.checked)
    }
  }
}
</script>

<style lang="scss" scoped>
.Mapping {
  .help {
    color: #777;
    font-size: 0.9rem;
  }
  .pre_ace {
    min-height: 500px;
  }
}
</style>
