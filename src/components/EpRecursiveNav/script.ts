import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import {
  SideMenuEntry,
  SideMenuRoute,
} from '@/tyypit';

@Component
export default class EpRecursiveNav extends Vue {
  @Prop({ default: [] })
  private value: any;

  private valueCopy: Array<SideMenuEntry> = [];
  private current: Array<SideMenuEntry> = [];
  private curTopItem: SideMenuEntry | null = null;

  public created() {
    this.processNewValue();
  }

  public previousSubmenu() {
    if (!this.curTopItem) {
      return;
    }

    if (this.curTopItem.route) {
      this.$router.replace({
        name: this.curTopItem.route.name,
        params: {
          ...this.curTopItem.route.params,
        },
      });
    }

    this.current = (this.curTopItem.parent && this.curTopItem.parent.children) ? this.curTopItem.parent.children : this.valueCopy;
    this.curTopItem = this.curTopItem.parent ? this.curTopItem.parent : null;
  }

  public enterSubmenu(item: SideMenuEntry) {
    if (!item.children) {
      return;
    }

    this.current = item.children;
    this.curTopItem = item;

    if (item.route) {
      this.$router.replace({
        name: item.route.name,
        params: {
          ...item.route.params,
        },
      });
    }
  }

  private isSubmenu(item: SideMenuEntry) {
    return (item.children && item.children.length > 0 && !item.flatten);
  }

  @Watch('value')
  private onValueChange() {
    this.processNewValue();
  }

  private processNewValue() {
    this.valueCopy = this.value;
    this.addParentRefs(this.valueCopy, null);

    if (this.$route) {
      let { found, newTopItem, newCurrent } = this.buildCurrentFromRoute(this.valueCopy, this.curTopItem);
      this.current = (found && newCurrent.length > 0) ? newCurrent : this.valueCopy;
      this.curTopItem = newTopItem;
    }
    else {
      this.current = this.valueCopy;
      this.curTopItem = null;
    }
  }

  private matchRouteName(route: SideMenuRoute): boolean {
    // Most trivial check at first: name must match
    return (route.name === this.$route.name && this.$route.matched.length > 0);
  }

  private splitRouteParams(): string[] {
    // Parse mandatory parameters for current path
    const matchedRoute = this.$route.matched[this.$route.matched.length - 1];
    const parentpath = (matchedRoute.parent) ? matchedRoute.parent.path : '';

    return matchedRoute.path
      .replace(parentpath, '')
      .split('/')
      .filter((path) => {
        return path.substr(0, 1) === ':';
      })
      .map(path => {
        return path.substr(1);
      });
  }

  private matchRouteParams(route: SideMenuRoute): boolean {
    return this.splitRouteParams().every(param => {
      return (this.$route.params[param] && route.params[param] && this.$route.params[param] === String(route.params[param]));
    });
  }

  private searchForRouteMatch(menuEntry: SideMenuEntry) {
    return (menuEntry.route && this.matchRouteName(menuEntry.route) && this.matchRouteParams(menuEntry.route));
  }

  private getEntryDetails(menuEntry: SideMenuEntry) {
    let newTopItem: SideMenuEntry | null = null;
    let newCurrent: SideMenuEntry[] = [];

    if (menuEntry.parent) {
      if (menuEntry.parent.flatten && menuEntry.parent.parent && menuEntry.parent.parent.children) {
        newTopItem = menuEntry.parent.parent;
        newCurrent = menuEntry.parent.parent.children;
      }
      else if (!menuEntry.parent.flatten && menuEntry.parent.children) {
        newTopItem = menuEntry.parent;
        newCurrent = menuEntry.parent.children;
      }
    }

    return { found: true, newTopItem, newCurrent };
  }

  private buildCurrentFromRoute(menuData: SideMenuEntry[], curTopItem: SideMenuEntry | null) {
    var found: boolean = false;
    var newTopItem: SideMenuEntry | null = null;
    var newCurrent: SideMenuEntry[] = [];

    menuData.every(menuItem => {
      if (this.searchForRouteMatch(menuItem)) {
        const retval = this.getEntryDetails(menuItem);
        found = true;
        newTopItem = retval.newTopItem;
        newCurrent = retval.newCurrent;
        return false;
      }

      // Iterate children (if any)
      if (menuItem.children) {
        const retval = this.buildCurrentFromRoute(menuItem.children, curTopItem);
        if (retval.found) {
          found = true;
          newTopItem = retval.newTopItem;
          newCurrent = retval.newCurrent;
          return false;
        }
      }

      return true;
    });

    // Return search results
    return { found, newTopItem, newCurrent };
  }

  private addParentRefs(menuData: SideMenuEntry[], parent: SideMenuEntry | null) {
    menuData.forEach(menuItem => {
      if (parent) {
        menuItem.parent = parent;
      }

      if (menuItem.children) {
        this.addParentRefs(menuItem.children, menuItem);
      }
    });
  }
}
