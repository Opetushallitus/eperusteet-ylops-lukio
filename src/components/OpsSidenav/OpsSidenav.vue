<template>
<ep-spinner v-if="isLoading" />
<div v-else class="sidebar">
  <div class="search">
    <ep-search v-model="query" />
  </div>
  <div>
    <ul class="navigation" v-if="valikkoData.length > 0">
      <ep-recursive-nav :value="valikkoData">
        <template v-slot:previousLink="{ itemData, itemRoute, navigate }">
          <li class="previous-link">
            <ops-sidenav-link class="back-btn" tag="span" :click="navigate" :clickParams="false">
              <fas icon="chevron-left" />
            </ops-sidenav-link>
            <ops-sidenav-link class="previous-link" tag="span" :to="itemRoute">
              <a class="btn btn-link">{{ kaanna(itemData.item) }}</a>
            </ops-sidenav-link>
          </li>
        </template>
        <template v-slot="{ itemData, isPreviousLink, isSubmenu, navigate, itemRoute }">
          <ops-sidenav-link :to="itemRoute" :class="{ 'module-link': onkoModTaiOj(itemData.item) }" v-if="!isSubmenu && itemRoute">
            <a class="btn btn-link">
                <div class="d-inline-flex">
                  <div>
                    <ep-color-ball class="mr-2" v-if="onkoModTaiOj(itemData.item)" :kind="itemData.item.objref.pakollinen ? 'pakollinen': 'valinnainen'">
                    </ep-color-ball>
                  </div>
                  <div>
                    <span>{{ kaanna(itemData.item) }}</span>
                    <span class="code-field" v-if="itemData.item.type === 'moduuli'">({{ haeModuuliKoodi(itemData.item) }})</span>
                  </div>
                </div>
            </a>
          </ops-sidenav-link>
          <li class="subheader" v-if="!isSubmenu && !itemRoute">
            <span>{{ kaanna(itemData.item) }}</span>
          </li>
          <ops-sidenav-link class="submenu" v-if="isSubmenu" :itemData="itemData" :to="itemRoute" :click="navigate">
            <a class="btn btn-link">{{ kaanna(itemData.item) }}</a>
            <fas icon="chevron-right" v-if="!itemData.item.hideChevron">
            </fas>
          </ops-sidenav-link>
        </template>
        <template v-slot:after="{ itemData, isPreviousLink, isSubmenu, navigate, itemRoute }">
          <li v-if="itemData.item.type === 'tekstikappale'">
            <router-link v-oikeustarkastelu="'muokkaus'" class="btn btn-link" :to="{ name: 'tekstikappale', params: { osaId: 'uusi', parentId: itemRoute.params.osaId } }">
              <fas class="mr-2" icon="plus">
              </fas>
              <span>{{ $t('uusi-tekstikappale') }}</span>
            </router-link>
          </li>
        </template>
      </ep-recursive-nav>
    </ul>
  </div>
</div>
</template>

<style scoped lang="scss" src="./style.scss"></style>
<script lang="ts" src="./script.ts"></script>
