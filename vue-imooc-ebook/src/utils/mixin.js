//实现代码复用
import { mapGetters, mapActions } from 'vuex'
import { themeList, addCss, removeAllCss } from './book'
import { saveLocation, getLocation } from './localStorage'

export const ebookMixin = {
    //把用到的计算属性都集成到一起了
    computed: {
        ...mapGetters([
            'fileName',
            'menuVisible',
            'settingVisible',
            'defaultFontSize',
            'defaultFontFamily',
            'fontFamilyVisible',
            'defaultTheme',
            'bookAvailable',
            'progress',
            'section',
            'isPaginating',
            'currentBook',
            'navigation',
            'cover',
            'metadata',
            'paginate',
            'pagelist',
            'offsetY',
            'isBookmark',
            'speakingIconBottom'
        ]),
        themeList() {
          return themeList(this)
        },
        // getSectionName() {
        //   return this.section ? this.navigation[this.section].label : ''
        // }
    },
    methods: {
        ...mapActions([
            'setFileName',
            'setMenuVisible',
            'setSettingVisible',
            'setDefaultFontSize',
            'setDefaultFontFamily',
            'setFontFamilyVisible',
            'setDefaultTheme',
            'setBookAvailable',
            'setProgress',
            'setSection',
            'setIsPaginating',
            'setCurrentBook',
            'setNavigation',
            'setCover',
            'setMetadata',
            'setPaginate',
            'setPagelist',
            'setOffsetY',
            'setIsBookmark',
            'setSpeakingIconBottom'
        ]),
        initGlobalStyle(){
            removeAllCss()
            switch(this.defaultTheme) {
              case 'Default' :
                addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
                break
              case 'Eye' :
                addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`)
                break
              case 'Gold' :
                addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_gold.css`)
                break
              case 'Night' :
                addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_night.css`)
                break
              default:
                addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)  
            } 
          },
          //更新进度百分比
          refreshLocation() {
            const currentLocation = this.currentBook.rendition.currentLocation()
            if (currentLocation && currentLocation.start) {
                const startCfi = currentLocation.start.cfi
                const progress = this.currentBook.locations.percentageFromCfi(startCfi)
                this.setProgress(Math.floor(progress * 100))
                this.setSection(currentLocation.start.index)
                saveLocation(this.fileName, startCfi)
            }
          },
          //简化代码，传入location定位，直接渲染到那。渲染完成后回调，初始化字体字号等
          display(target, cb) {
            if (target) {
              this.currentBook.rendition.display(target).then(() => {
                this.refreshLocation()
                if (cb) cb()
              })
            } else {
              this.currentBook.rendition.display().then(() => {
                this.refreshLocation()
                if (cb) cb()
              })
            }
          },
    }
     
}