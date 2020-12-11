<template>
  <div id="app">
    <div class=" bg-white px-2 pt-3 pb-1 shadow">
      <b-form
          @submit="addManyItems"
      >
        <b-input-group>
          <b-form-textarea
              required
              id="textarea"
              v-model="newDomainsString"
              placeholder="Enter domains, one per row..."
              rows="3"
              max-rows="20"
          >

          </b-form-textarea>
          <b-input-group-append>
            <b-button variant="outline-success" type="submit"
                      v-if="loading"
            >
              <b-spinner small type="grow"></b-spinner>
            </b-button>
            <b-button variant="outline-success" type="submit"
                      v-else
            >
              Add domains
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-form>

      <!--        <b-form @submit="addItem" class="my-2">-->
      <!--          <b-input-group prepend="Add domain:" class="mt-3">-->
      <!--            <b-form-input v-model="newDomain" placeholder="example.com" required></b-form-input>-->
      <!--            <b-input-group-append>-->
      <!--              <b-button type="submit" variant="outline-success"-->
      <!--              >Add-->
      <!--              </b-button>-->
      <!--            </b-input-group-append>-->
      <!--          </b-input-group>-->
      <!--        </b-form>-->
    </div>
    <b-container>
      <b-row>
        <b-col cols="12" lg="10" style="max-width:1200px; height: 85vh; overflow-y:auto;" class="mx-auto">
          <b-table
              head-variant="light"
              :busy="!getTableRows.length"
              :fields="getTableFields"
              :items="getTableRows"
              striped
              hover
          >
            <template #cell(domain)="row">
              <a :href="`https://${row.item.domain}`" target="_blank" class="text-left d-block">{{
                  row.item.domain
                }}</a>
            </template>
            <template #cell(controls)="row">
              <b-button variant="outline-success" class="mr-2" type="submit"
                        v-if="loading"
              >
                <b-spinner small type="grow"></b-spinner>
              </b-button>
              <b-button
                  v-else
                  block
                  size="md" @click="deleteItem(row.item.id)" variant="outline-danger" class="mr-2">
                Delete
              </b-button>
              <!--          <b-button size="sm" variant="outline-secondary" class="mr-2">-->
              <!--            Edit-->
              <!--          </b-button>-->
            </template>
            <template #table-busy>
              <div class="text-center text-primary my-2">
                <b-spinner class="align-middle"></b-spinner>
                <strong>Loading...</strong>
              </div>
            </template>
          </b-table>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';

import axios from 'axios';

@Component({
  components: {},
})
export default class App extends Vue {
  private loading = false;
  private newDomain: string | null = null;
  private domains: Array<string> = [];
  private newDomainsString = '';

  private clearDomainsInput() {
    this.newDomainsString = '';
  }

  get getDomainsToSave(): Array<string> {
    return this.newDomainsString.replace(/\s/g, '').split('\n');
  }

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
    this.loading = true;
    await axios.post('https://uptime-master.herokuapp.com/addone/', {
      data: {
        host: this.newDomain
      }
    })
        .then(() => {
          this.getDomainsFromServer()
        }).then(() => {
          this.loading = false;
        })
  }

  private async addManyItems(e) {
    e.preventDefault();
    console.log(`Add many items`)
    if (this.getDomainsToSave[0].length >= 5 && !this.getDomainsToSave.find((domain) => {
      console.log(domain)
      return !/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(domain)
    })) {
      this.loading = true;
      await axios.post('https://uptime-master.herokuapp.com/addmany/', {
        data: {
          hosts: this.getDomainsToSave
        }
      })
          .then(() => {
            this.getDomainsFromServer();
          })
          .then(() => {
            this.loading = false;
            this.clearDomainsInput();
          })
    } else {
      this.makeToast('danger', 'wrong input')
      return;
    }
  }

  private async deleteItem(id) {
    this.loading = true;
    console.log(`DeleteItem`)
    console.log(id)
    await axios.delete('https://uptime-master.herokuapp.com/deleteone/', {
      data: {
        id: id
      }
    })
        .then(response => {
          console.log(response)
          this.domains = this.domains.filter(domain => domain._id != id);
          console.log(`Done!`)
        })
        .then(() => {
          this.loading = false;
        })
  }

  private async getDomainsFromServer() {
    this.loading = true;
    await axios.get('https://uptime-master.herokuapp.com/getdomains/').then((res: any) => {
      this.domains = res.data.domains;
    }).then(() => {
      console.log(this.domains)
    })
        .then(() => {
          this.loading = false;
        })
  }

  private makeToast(variant = 'info', text = '') {
    this.toastCount++
    this.$bvToast.toast(text, {
      title: 'Notify',
      variant: variant,
      toaster: 'b-toaster-bottom-right',
      appendToast: true,
      autoHideDelay: 5000,
    })
  }

  created() {
    this.loading = true;
    this.getDomainsFromServer().then(() => {
      this.loading = false;
    })
  }
}
</script>

<style lang="scss">
html, body {
  height: 100%;
}

#app {
  font-family:             Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing:  antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align:              center;
  color:                   #2C3E50;
}

.remove svg {
  transition: color .3s ease-in-out, transform .1s ease-in-out;
}

.remove:hover svg {
  fill:      darkred;
  transform: scale(1.2);
}

.table {
  td {
    padding:        0;
    vertical-align: middle;

    a {
      font-weight: bold;
      font-size:   1.2rem;
      padding:     0.5em 2em;
      transition:  all .3s ease-in-out;
    }
  }
}

.table.b-table > thead > tr > th {
  background-color: white;
  position:         sticky;
  position:         -webkit-sticky;
  top:              0;
  z-index:          2;
}

.table tr:hover {
  //box-shadow: inset 0 0 5px 2px #DC3545;

}

.table-hover tbody tr:hover td, .table-hover tbody tr:hover th {
  button {
    color:            white;
    background-color: #DC3545;
  }

  a {
    //color:     #ACD9E7;
    transform: scale(1.1) translateX(5%);
  }

  color: white;
}
</style>
