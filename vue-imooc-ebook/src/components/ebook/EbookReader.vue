<template>
    <div class="ebook-reader">
        <div id="read"></div>
    </div>
</template>

<script>
import { 
    getFontFamily, 
    saveFontFamily, 
    getFontSize, 
    saveFontSize, 
    getTheme, 
    saveTheme,
    getLocation
    } from '../../utils/localStorage'
  import { ebookMixin } from '../../utils/mixin'
  import { flatten } from '../../utils/book'
  import Epub from 'epubjs'

global.ePub = Epub
export default {
    //部分混入，精简代码
    mixins: [ebookMixin],
    methods: {
        //将actions中的方法映射过来,返回根据setMenuVisible去getters中去找到对应的方法，后面调用是使用的找到的方法。属性的话是返回对应的属性
        // ...mapActions(['setMenuVisible']),  
        prePage() {
            if(this.rendition) {
                this.rendition.prev().then(() => {
                  this.refreshLocation()
                })  
                this.hideTitleAndMenu()
            }
        },
        nextPage() {
            if(this.rendition) {
                this.rendition.next().then(() => {
                  this.refreshLocation()
                })
            }
            this.hideTitleAndMenu()
        },
        toggleTitleAndMenu() {
            this.setSettingVisible(-1)
            this.setFontFamilyVisible(false)
            this.setMenuVisible(!this.menuVisible)
        },
        initFontSize() {
          let fontSize = getFontSize(this.fileName)
          if(!fontSize) {
              saveFontSize(this.fileName,this.defaultFontSize)
          } else {
              this.rendition.themes.fontSize(fontSize)
              this.setDefaultFontSize(fontSize)
          }
        },
        initFontFamily() {
          let font = getFontFamily(this.fileName)
          if(!font) {
              saveFontFamily(this.fileName,this.defaultFontFamily)
          } else {
              this.rendition.themes.font(font)
              this.setDefaultFontFamily(font)
          }
        },
        initTheme() {
          let defaultTheme = getTheme(this.fileName)
          if (!defaultTheme) {
            defaultTheme = this.themeList[0].name
            saveTheme(this.fileName, defaultTheme)
          }
          this.setDefaultTheme(defaultTheme)
          this.themeList.forEach(theme => {
            this.rendition.themes.register  (theme.name, theme.style)
          })
          this.rendition.themes.select(defaultTheme)
          },
        initRendition() {
          this.rendition = this.book.renderTo('read',{
            width: innerWidth,
            height: innerHeight,
            method: 'default' //微信兼容性
          })
          const location = getLocation(this.fileName)
          this.display(location, () => {
            this.initTheme()
            this.initFontFamily()
            this.initFontSize()  
            this.initGlobalStyle()  
          })
          this.rendition.hooks.content.register(contents => {
              Promise.all([
              contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`),
              contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`),
              contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`),
              contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/cabin.css`)
              ]).then(() => {})     
            }
            )
        },
        initGesture() {
          //on为epubjs提供的监听事件方法
          this.rendition.on('touchstart', event => {
            this.touchStartX = event.changedTouches[0].clientX;
            this.touchStartTime = event.timeStamp
            })
          this.rendition.on('touchend', event => {
            const offsetX = event.changedTouches[0].clientX - this.touchStartX;
            const time = event.timeStamp - this.touchStartTime;
            console.log(offsetX, time);
            if(time < 500 && offsetX > 40) {
                this.prePage(); 
            } else if(time < 500 && offsetX < -40) {
                this.nextPage();
            } else {
                this.toggleTitleAndMenu()
            }
            //阻止默认事件，阻止冒泡
            event.preventDefault()
            event.stopPropagation()
            })
        },
        parseBook() {
          this.book.loaded.cover.then(cover => {
              this.book.archive.createUrl(cover).then(url => {
                this.setCover(url) 
                })
          })
          this.book.loaded.metadata.then(metadata => {
            this.setMetadata(metadata) })

          this.book.loaded.navigation.then(nav => {
            const navItem = flatten(nav.toc)

            function find(item, level = 0) {
              return !item.parent ? level : find(navItem.filter(parentItem => parentItem.id === item.parent)[0], ++level)
            }

            navItem.forEach(item => {
              item.level = find(item)
            })
            this.setNavigation(navItem)
          })
        },
        initEpub() {
            // const url = process.env.VUE_APP_RES_URL + '/epub/' + this.fileName + '.epub';
            const url = 'http://192.168.1.3:8081/epub/' + this.fileName + '.epub';
            console.log(url);
            this.book = new Epub(url)
            this.setCurrentBook(this.book)
            this.initRendition()
            this.initGesture()
            this.parseBook()
            this.book.ready.then(() => {
              return this.book.locations.generate(750 * (window.innerWidth / 375) * getFontSize(this.fileName) / 16).then(locations => {
                //   console.log(locations)
                this.setBookAvailable(true)
                this.refreshLocation()
              })
            })   
        }
    },
    mounted () {
        //根据输入的url获取到nginx目录，然后下载,哪里负责下载呢？
        this.setFileName(this.$route.params.fileName.split('|').join('/')).then(() => {
            this.initEpub() 
        })  
    }   
}
</script>

<style lang="scss" scoped>
    
</style>