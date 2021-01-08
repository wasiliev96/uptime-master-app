<template>
  <div id="app">
    <b-modal v-model="showAuthModal" hide-footer>
      <b-form @submit="auth" ref="auth" @submit.prevent="auth">
        <b-form-group
            id="input-group-1"
            label-for="input-1"
            description="We'll never share your email with anyone else."
        >
          <b-form-input
              id="username"
              v-model="credentials.username"
              type="text"
              placeholder="Enter username"
              required
          ></b-form-input>
          <b-form-input
              id="username"
              v-model="credentials.password"
              type="password"
              required
          ></b-form-input>
        </b-form-group>
        <b-button variant="primary" type="submit" :disabled="loading">
          <b-spinner v-if="loading" small type="grow"></b-spinner>
          <span v-else>Submit</span>
        </b-button>
        <!--        <b-button type="reset" variant="danger">Reset</b-button>-->
      </b-form>
    </b-modal>
    <b-button variant="outline-success" type="submit" v-if="loading">
      <b-spinner small type="grow"></b-spinner>
    </b-button>
    <b-btn block variant="outline-danger" @click="logout" v-else>Logout</b-btn>
    <div class=" bg-white px-2 pt-3 pb-1 shadow">
      <b-form @submit="addManyItems">
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
            <b-button variant="outline-success" type="submit" v-if="loading">
              <b-spinner small type="grow"></b-spinner>
            </b-button>
            <b-button variant="outline-success" type="submit" v-else>
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
    <b-container class="pb-5">
      <b-row>
        <b-col
            cols="12"
            lg="10"
            style="max-width:1200px; height: 85vh; overflow-y:auto;"
            class="mx-auto "
        >
          <b-table
              head-variant="light"
              :busy="!getTableRows.length"
              :fields="getTableFields"
              :items="getTableRows"
              striped
              hover
          >
            <template #cell(domain)="row">
              <a
                  :href="`https://${row.item.domain}`"
                  target="_blank"
                  class="text-left d-inline-block"
              >{{ row.item.domain }}</a
              >
            </template>
            <template #cell(controls)="row">
              <!-- Ping -->
              <b-button
                  size="md"
                  @click="ping(row.item.domain, row.item.id)"
                  class="mr-2"
                  :variant="
                  row.item.status && row.item.status === 200
                    ? 'success'
                    : row.item.status && row.item.status <= 302
                    ? 'warning'
                    : row.item.status && 'danger'
                "
              >
                <span v-if="!row.item.status">{{ '&#9992;' }}</span>
                <b-spinner small type="grow" v-else-if="row.item.status==='0'"></b-spinner>
                <span v-else v-text="row.item.status"></span>
              </b-button>

              <!-- Delete -->
              <b-button
                  variant="outline-success"
                  class="mr-2"
                  type="submit"
                  v-if="loading"
              >
                <b-spinner small type="grow"></b-spinner>
              </b-button>
              <b-button
                  v-else
                  size="md"
                  @click="deleteItem(row.item.id)"
                  variant="outline-danger"
                  class="mr-2"
              >
                &#10761;
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
import {Component, Vue} from "vue-property-decorator";

import axios from "axios";

@Component({
  components: {},
})
export default class App extends Vue {
  private authorized = true;
  private credentials = {
    username: "",
    password: "",
  };
  private baseURL = "https://uptime-master.herokuapp.com";

  private showAuthModal = false;

  private async auth() {
    this.loading = true;
    const access = await axios.get(`${this.baseURL}/getdomains`, {
      auth: {
        username: this.credentials.username,
        password: this.credentials.password,
      },
    });
    if (access) {
      localStorage.setItem("username", this.credentials.username);
      localStorage.setItem("password", this.credentials.password);
      this.authorized = true;
      this.showAuthModal = false;
      this.getDomainsFromServer().then(() => {
        this.loading = false;
      });
    } else {
      this.showAuthModal = true;
    }
  }

  private logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    this.authorized = false;
    this.credentials.username = "";
    this.credentials.password = "";
    this.domains = [];
    this.showAuthModal = true;
    // window.location.reload();
  }

  private loading = false;
  private newDomain: string | null = null;
  private domains: Array<any> = [];
  private newDomainsString = "";

  private clearDomainsInput() {
    this.newDomainsString = "";
  }

  get getDomainsToSave(): Array<string> {
    return this.newDomainsString.split("\n").map((domain) => domain.trim());
  }

  get getDomains() {
    return this.domains;
  }

  get getTableFields() {
    return [
      {
        key: "domain",
        label: "Domain",
        sortable: true,
      },
      {
        key: "controls",
        label: "Controls",
        sortable: false,
      },
    ];
  }

  get getTableRows() {
    return this.domains.map((domain: any) => {
      return {
        domain: domain.host,
        id: domain._id,
        status: domain.status,
      };
    });
  }

  private async addItem() {
    this.loading = true;
    await axios
        .post(
            `${this.baseURL}/addone/`,
            {
              data: {
                host: this.newDomain,
              },
            },
            {
              auth: {
                username: this.credentials.username,
                password: this.credentials.password,
              },
            }
        )
        .then(() => {
          this.getDomainsFromServer();
        })
        .then(() => {
          this.loading = false;
        });
  }

  private async addManyItems(e: any) {
    e.preventDefault();
    console.log(`Add many items`);
    if (
        this.getDomainsToSave[0].length >= 5 &&
        !this.getDomainsToSave.find((domain) => {
          console.log(domain);
          return !/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(
              domain
          );
        })
    ) {
      this.loading = true;
      await axios
          .post(
              `${this.baseURL}/addmany/`,
              {
                data: {
                  hosts: this.getDomainsToSave,
                },
              },
              {
                auth: {
                  username: this.credentials.username,
                  password: this.credentials.password,
                },
              }
          )
          .then(() => {
            this.getDomainsFromServer();
          })
          .then(() => {
            this.loading = false;
            this.clearDomainsInput();
          });
    } else {
      this.makeToast("danger", "wrong input");
      return;
    }
  }

  private async deleteItem(id: any) {
    this.loading = true;
    console.log(`DeleteItem`);
    console.log(id);
    await axios
        .delete(`${this.baseURL}/deleteone/`, {
          data: {
            id: id,
          },
          auth: {
            username: this.credentials.username,
            password: this.credentials.password,
          },
        })
        .then((response) => {
          console.log(response);
          this.domains = this.domains.filter((domain: any) => domain._id != id);
          console.log(`Done!`);
        })
        .then(
            () => {
              this.loading = false;
              this.makeToast("success", "domain removed");
            },
            () => {
              this.makeToast("danger", "Error");
            }
        );
  }

  private async getDomainsFromServer() {
    this.loading = true;
    await axios
        .get(`${this.baseURL}/getdomains/`, {
          auth: {
            username: this.credentials.username,
            password: this.credentials.password,
          },
        })
        .then((res: any) => {
          this.domains = res.data.domains.map((domain: any) => {
            return {...domain, status: null};
          });
        })
        .then(() => {
          console.log(this.domains);
        })
        .then(() => {
          this.loading = false;
          this.makeToast("success", "Domain successfully gotted from server");
        });
  }

  private makeToast(variant = "info", text = "") {
    //@ts-ignore
    this.$bvToast.toast(text, {
      title: "Notify",
      variant: variant,
      toaster: "b-toaster-bottom-right",
      appendToast: true,
      autoHideDelay: 5000,
    });
  }

  async mounted() {
    if (localStorage.username && localStorage.password) {
      this.credentials.username = localStorage.username;
      this.credentials.password = localStorage.password;
      await axios
          .get(`${this.baseURL}/getdomains`, {
            auth: {
              username: this.credentials.username,
              password: this.credentials.password,
            },
          })
          .then(() => {
            this.authorized = true;
            this.showAuthModal = false;
          })
          .then(() => {
            if (!this.authorized) {
              this.showAuthModal = true;
            } else {
              this.getDomainsFromServer();
            }
          });
    } else {
      this.authorized = false;
      this.showAuthModal = true;
    }
  }

  async ping(host: string, id: string) {
    const domainToChangeIndex = this.domains.findIndex(
        (domain: any) => domain._id === id
    );
    this.domains[domainToChangeIndex].status = '0';
    console.log(`ping https://${host}`);
    fetch("https://" + host)
        .then((res) => {
          console.log(res);
          console.log(domainToChangeIndex)
          if (domainToChangeIndex >= 0) {
            this.domains[domainToChangeIndex].status = res.status;
            this.makeToast(
                res.status === 200
                    ? "success"
                    : res.status <= 302
                    ? "warning"
                    : "danger",
                `Host: ${host}\nPing status: ${res.status}`
            );
          } else {
            console.log(`not found domain`);
          }
        })
        .catch((e) => {
          this.makeToast('warning', 'Can`t connect. Try to enable CORS(by extension) and VPN')
          console.log(e);
        });
  }
}
</script>

<style lang="scss">
html,
body {
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
  transition: color 0.3s ease-in-out, transform 0.1s ease-in-out;
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
      transition:  all 0.3s ease-in-out;
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

.table-hover tbody tr:hover td,
.table-hover tbody tr:hover th {
  // button {
  //   color: white;
  //   background-color: #dc3545;
  // }

  a {
    //color:     #ACD9E7;
    transform: scale(1.1) translateX(5%);
  }

  color: white;
}
</style>
