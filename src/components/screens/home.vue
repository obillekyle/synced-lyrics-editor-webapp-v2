p
<script setup lang="ts">
  import { onMounted } from 'vue';
  import Divider from '../elements/Divider/divider.vue';
  import { Icon } from '@iconify/vue';
  import _presets from '../modals/_presets';
  import { keyHandlers } from '../keybinds/keys';
  import { rippleEffect } from '@/api/util';
  import SvgBg from './svg-bg.vue';
  import SquareImage from '../elements/square-image.vue';
  import WavyDivider from '../elements/Divider/wavy-divider.vue';

  const Screen = window.app.screen;
  const version = window.app.version_string;

  const links: { label: string; link?: string }[] = [
    {
      label: 'Website',
      link: 'https://okyle.xyz',
    },
    {
      label: 'Github Repo',
      link: 'https://github.com/obillekyle/synced-lyrics-editor-webapp-v2',
    },
    {
      label: 'Old Synced Lyrics Maker',
      link: 'https://lyrics-editor.okyle.xyz',
    },
    {
      label: 'Inspired by Material Design v3',
      link: 'https://m3.material.io/',
    },
    {
      label: 'Report an issue',
      link: 'https://github.com/obillekyle/synced-lyrics-editor-webapp-v2/issues',
    },
  ];

  function share() {
    navigator.share({
      title: 'Synced Lyrics Editor v2',
      url: 'https://sle.okyle.xyz',
    });
  }
</script>

<template>
  <div class="home">
    <div class="logo-container">
      <div class="primary-container">
        <h1>Synced Lyrics Editor</h1>
        <p>
          Create your own synced lyrics for the music you love right from your
          browser. A sound file is required
        </p>
      </div>
      <div class="logo-wrapper">
        <SvgBg />
        <SquareImage
          src="/assets/logo.png"
          alt="Lyric"
          size="200"
          frame="circle"
        />
      </div>
    </div>

    <div class="section-wrapper">
      <h1 class="section-header">Get Started</h1>
      <div class="section-card-container">
        <div
          class="card"
          @click="() => keyHandlers.uploadAudio()"
          @pointerdown="rippleEffect"
        >
          <div class="icon">
            <Icon icon="material-symbols:upload" :width="48" />
          </div>
          <div class="info">
            <h2>Upload Music</h2>
            <p>Open your music file</p>
          </div>
        </div>

        <div
          class="card"
          @click="() => _presets.uploadNewLrc()"
          @pointerdown="rippleEffect"
        >
          <div class="icon">
            <Icon icon="material-symbols:upload-file-outline" :width="48" />
          </div>
          <div class="info">
            <h2>Upload Lyrics</h2>
            <p>Open your lrc file</p>
          </div>
        </div>

        <div
          class="card"
          @click="() => Screen.set('edit')"
          @pointerdown="rippleEffect"
        >
          <div class="icon">
            <Icon icon="material-symbols:edit-outline" :width="48" />
          </div>
          <div class="info">
            <h2>Go to Editor</h2>
            <p>Paste or edit your lyrics</p>
          </div>
        </div>

        <div
          class="card"
          @click="() => _presets.showKeyBinds()"
          @pointerdown="rippleEffect"
        >
          <div class="icon">
            <Icon icon="material-symbols:keyboard-outline" :width="48" />
          </div>
          <div class="info">
            <h2>Keybinds</h2>
            <p>View all keybinds</p>
          </div>
        </div>
      </div>
    </div>

    <div class="section-wrapper">
      <h1 class="section-header">Other Things</h1>
      <div class="section-card-container">
        <div
          class="card"
          @click="() => _presets.changelog()"
          @pointerdown="rippleEffect"
        >
          <div class="icon">
            <Icon icon="material-symbols:book-2-outline" :width="48" />
          </div>
          <div class="info">
            <h2>Show App Changelog</h2>
            <p>See what's new</p>
          </div>
        </div>

        <div
          class="card"
          @click="() => _presets.openSettings()"
          @pointerdown="rippleEffect"
        >
          <div class="icon">
            <Icon icon="material-symbols:settings-outline" :width="48" />
          </div>
          <div class="info">
            <h2>Open Settings</h2>
            <p>Change app theme, languages and more...</p>
          </div>
        </div>
        <div class="card" @click="() => share()" @pointerdown="rippleEffect">
          <div class="icon">
            <Icon icon="material-symbols:share-windows-sharp" :width="48" />
          </div>
          <div class="info">
            <h2>Share</h2>
            <p>Share this webapp with your friends</p>
          </div>
        </div>
      </div>
    </div>

    <div class="section-wrapper">
      <p class="section-footer">You can toggle the home button at settings</p>
    </div>

    <div class="section-wrapper">
      <WavyDivider />

      <div class="section-links-container">
        <div class="links">
          <img alt="Logo" src="/logo.svg" width="48" height="48" />
          <h3>Synced Lyrics Editor and Maker v2</h3>
          <a class="link" href="https://github.com/obillekyle" target="_blank">
            <span class="info">By: @obillekyle</span>
            <div class="icon">
              <Icon icon="material-symbols:open-in-new" :width="24" />
            </div>
          </a>
          <p class="link">
            <span class="info">Version: {{ version }}</span>
          </p>
        </div>

        <div class="links" @pointerdown="rippleEffect">
          <a
            class="link"
            :key="index"
            :href="item.link"
            :target="item.link?.startsWith('https://') ? '_blank' : ''"
            v-for="(item, index) in links"
          >
            <span class="info">
              {{ item.label }}
            </span>
            <div class="icon" v-if="item.link?.startsWith('https://')">
              <Icon icon="material-symbols:open-in-new" :width="24" />
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .home {
    width: 100%;
    max-width: 1024px;
    margin-inline: auto;
    padding: var(--lg);

    .logo-container {
      display: grid;
      width: 100%;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      grid-auto-flow: row;
      grid-gap: var(--md);
      > * {
        border-radius: var(--lg);
        max-width: 100%;
      }

      .primary-container {
        display: flex;
        flex-direction: column;
        gap: var(--sm);
        padding: var(--size-sm);
        background-color: var(--color-100);
        h1 {
          font-size: clamp(2rem, 5vw, 5rem);
          font-weight: 500;
        }

        p {
          font-size: clamp(1rem, 4vw, 1.5rem);
          color: var(--mono-900);
        }
      }

      .logo-wrapper {
        background: var(--color-400);
        border-radius: 16px;
        min-height: 300px;
        display: grid;
        position: relative;
        place-content: center;
        overflow: hidden;

        img {
          position: relative;
          z-index: 1;
        }

        svg {
          height: auto;
          position: absolute;
          bottom: 0;
        }
      }
    }

    .section-wrapper {
      margin-block: var(--size-lg);
      .section-header {
        font-size: 2.5rem;
        font-weight: 500;
        margin-bottom: var(--sm);
      }

      .section-footer {
        font-size: 1.2rem;
        font-weight: 500;
        color: var(--mono-600);
        text-align: center;
      }

      .section-links-container {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        grid-auto-flow: row;
        grid-gap: var(--md);
        .links {
          display: flex;
          flex-direction: column;
          padding: var(--lg);
          gap: var(--md);

          img {
            margin-left: -4px;
            margin-top: -12px;
          }

          h3 {
            font-weight: 500;
            color: var(--mono-800);
          }

          .link {
            display: flex;
            text-decoration: none;
            width: max-content;
            color: var(--mono-600);
            border-bottom: 2px solid transparent;
            gap: var(--sm);
            align-items: center;
            transition:
              border-bottom 0.2s,
              color 0.2s;

            &:is([href]):hover {
              cursor: pointer;
              color: var(--mono-900);
              border-bottom: 2px solid var(--mono-200);
            }
            .icon {
              place-items: center;
              line-height: 0;
            }

            span {
              font-weight: 500;
              letter-spacing: 0.5px;
              font-size: var(--font-lg);
            }
          }
        }
      }

      .section-card-container {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(auto-fill, minmax(max(300px, 40%), 1fr));
        grid-auto-flow: row;
        grid-gap: var(--md);

        .card {
          display: grid;
          cursor: pointer;
          overflow: hidden;
          position: relative;
          grid-template-columns: 64px 1fr;
          grid-template-rows: 64px;
          grid-template-areas: 'icon info';
          grid-gap: var(--lg);
          align-items: center;
          background: var(--color-100);
          padding: var(--lg);
          border-radius: var(--lg);
          .icon {
            grid-area: icon;
            display: grid;
            place-items: center;
            background: var(--color-300);
            border-radius: var(--md);
            width: 64px;
            aspect-ratio: 1;
          }

          .info {
            grid-area: info;
            display: flex;
            flex-direction: column;
            gap: var(--xs);
          }

          h2 {
            font-size: 1.5rem;
            font-weight: 500;
          }

          p {
            font-size: 1rem;
            color: var(--mono-800);
          }
        }
      }
    }
  }
</style>
