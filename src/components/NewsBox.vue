<template>
  <div id="bravonews">
    <div v-if="Array.isArray(news_items) && news_items.length" class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-5">
          <h6 style="border-bottom: 1px solid rgb(204,204,204)" class="text-muted">News</h6>
        </div>
      </div>
      <div class="row justify-content-center">
        <div class="col-5">
          <template  v-for="item in news_items">
            <p class="h6" v-if="'url' in item"><a v-bind:href="item.url">{{ item.title }}</a></p>
            <p v-else>{{ item.title }}</p>
            <p class="text-muted">{{ item.content }}</p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue'

export default {
  name: 'NewsBox',
  components: { },
  data: function() {
    return {
      news_items: []
    };
  },
  methods: {
    process_news: function(news_data){
      this.news_items = news_data
    }
  },
  mounted: function() {
    fetch('/news.json', {
      method: "GET",
      mode: "same-origin",
      cache: "no-cache",
      credentials: "same-origin"
    }).then(resp => {
      if(resp.ok){
        resp.json().then(data => { this.process_news(data) })
      }
    })
  },
}
</script>
