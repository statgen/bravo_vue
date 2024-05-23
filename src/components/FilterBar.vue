<template>
  <div class="filter-bar">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12" style="padding-left: 0px; padding-top: 2px; padding-bottom: 2px;">
          <QualityFilterButton v-bind="$attrs" givenCategory="quality" title="Quality"/>
          <AnnotationFilterButton v-bind="$attrs" givenCategory="annotation" title="Annotation"/>
          <LofteeFilterButton v-bind="$attrs" givenCategory="loftee" title="LOFTEE"/>
          <FrequencyFilterButton v-bind="$attrs" givenCategory="frequency" title="Frequency" fieldVal="allele_freq"/>
          <BaseMinMaxFilterButton v-bind="$attrs" givenCategory="cadd" title="CADD" fieldVal="cadd_phred"/>
          <!--
          <rsIdFilterButton/>
          -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QualityFilterButton from '@/components/filter/QualityFilterButton.vue'
import AnnotationFilterButton from '@/components/filter/AnnotationFilterButton.vue'
import LofteeFilterButton from '@/components/filter/LofteeFilterButton.vue'
import BaseMinMaxFilterButton from '@/components/filter/BaseMinMaxFilterButton.vue'
import FrequencyFilterButton from '@/components/filter/FrequencyFilterButton.vue'

export default {
  name: "FilterBar",
  inheritAttrs: false,
  props: {
    filters: {
      type: Object,
      default: function(){ return {} }
    }
  },
  components: {
    QualityFilterButton,
    AnnotationFilterButton,
    LofteeFilterButton,
    BaseMinMaxFilterButton,
    FrequencyFilterButton
  },
}
</script>
