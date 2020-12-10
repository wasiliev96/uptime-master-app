<template>
  <div id="app">
    <b-card class="mx-auto w-50" title="Domains">
      <b-form @submit="addItem()">
        <b-input-group prepend="New domain:" class="mt-3">
          <b-form-input v-model="newDomain" placeholder="example.com" required></b-form-input>
          <b-input-group-append>
            <b-button type="submit" variant="outline-success"
            >Save
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-form>
      <b-table
          small
          :fields="getTableFields"
          :items="getTableRows"
          striped
          hover>

        <template #cell(controls)="row">
          <b-button size="sm" @click="deleteItem(row.item.id)" variant="outline-danger" class="mr-2">
            Delete
          </b-button>
          <b-button size="sm" variant="outline-secondary" class="mr-2">
            Edit
          </b-button>
        </template>
      </b-table>
    </b-card>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';

import axios from 'axios';

@Component({
  components: {},
})
export default class App extends Vue {
  private newDomain: string | null = null;
  private domains: Array<string> = [];

  get getDomains() {
    return this.domains;
  }

  get getTableFields() {
    return [
      {
        key: 'domain',
        label: 'Domain',
        sortable: true
      },
      {
        key: 'controls',
        label: 'Controls',
        sortable: false
      }
    ]
  }

  get getTableRows() {
    return this.domains.map((domain: any) => {
      return {
        domain: domain.host,
        id: domain._id
      }
    })
  }

  private async addItem() {
    await axios.post('http://localhost:3000/addone/', {
      data: {
        host: this.newDomain
      }
    })
        .then(() => {
          this.getDomainsFromServer()
        })
  }

  private async deleteItem(id) {
    console.log(`DeleteItem`)
    console.log(id)
    await axios.delete('http://localhost:3000/deleteone/', {
      data: {
        id: id
      }
    })
        .then(response => {
          console.log(response)
          this.domains = this.domains.filter(domain => domain._id != id);
          console.log(`Done!`)
        });
  }

  private async getDomainsFromServer() {
    await axios.get('http://localhost:3000/getdomains/').then((res: any) => {
      this.domains = res.data.domains;
    }).then(() => {
      console.log(this.domains)
    })
  }

  created() {
    this.getDomainsFromServer();
  }
}
</script>

<style lang="scss">
#app {
  font-family:             Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing:  antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align:              center;
  color:                   #2C3E50;
  margin-top:              60px;
}

.remove svg {
  transition: color .3s ease-in-out, transform .1s ease-in-out;
}

.remove:hover svg {
  fill:      darkred;
  transform: scale(1.2);
}
</style>
