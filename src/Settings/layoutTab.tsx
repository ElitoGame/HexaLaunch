import { getRelevantApps } from '../settings';
import { Box, Input, Center, HStack } from '@hope-ui/solid';

import { createSignal, For, Show } from 'solid-js';
import { getSearchResults, searchAppDB } from '../main';

export const LayoutTab = () => {
  const [getPage, setPage] = createSignal<number>(0);
  let searchBar: HTMLInputElement | undefined;

  return (
    <>
      <p>Drag & drop assets to your layout.</p>
      <h2>Search Assets</h2>
      <Input
        bg="#C3C2C2"
        ref={searchBar}
        class="text-text"
        onInput={(e) => {
          searchAppDB((e.target as HTMLInputElement).value);
          setPage(0);
        }}
      ></Input>
      <br></br>
      <br></br>

      <Box class="bg-gray mb-5" minH="100px" borderRadius="$lg">
        <Show when={!((getSearchResults()?.hits?.length ?? 0) > 0)}>
          <p class="text-base flex justify-center p-3 flex align-center justify-center">
            {' '}
            Search something to see results!
          </p>
        </Show>
        <ul class="p-1">
          <For each={getSearchResults()?.hits ?? []}>
            {(res) => (
              <>
                <Box
                  borderRadius="$lg"
                  onClick={() => {
                    if (searchBar) {
                      if (searchBar.value.match(/^([a-z]:)?(\/|\\).*/gi)) {
                        const newPath =
                          res.document.executable.replaceAll('\\', '/') +
                          (res.document.type === 'Folder' ? '/' : '');
                        searchBar.value = newPath;

                        searchAppDB(newPath);
                        setPage(0);
                        searchBar.focus();
                      }
                    }
                  }}
                >
                  <li>
                    <HStack>
                      <Box class="my-2 bg-background p-3.5" borderRadius="$lg">
                        <div class="w-25">
                          <img src={res.document.icon} class="w-7"></img>
                        </div>
                      </Box>
                      <div>
                        <Box
                          class="my-2 ml-3 p-2 bg-background whitespace-nowrap"
                          maxW="280px"
                          minW="280px"
                          borderRadius="$lg"
                        >
                          <p class="truncate ...">{res.document.name}</p>
                          <p class="truncate ...">{res.document.executable}</p>{' '}
                        </Box>
                      </div>
                    </HStack>
                  </li>
                </Box>
              </>
            )}
          </For>
        </ul>
      </Box>
      <Show when={(getSearchResults()?.hits?.length ?? 0) > 0}>
        <Center>
          <button
            class="bg-blue-300 rounded-sm px-2 py-1 m-2"
            onClick={() => {
              if (searchBar?.value !== '' && getPage() > 0) {
                setPage((page) => page - 1);
                searchAppDB(searchBar?.value ?? '', getPage() * 10);
              }
            }}
          >
            Prev
          </button>
          <span>{getPage() + 1}</span>
          <button
            class="bg-blue-300 rounded-sm px-2 py-1 m-2"
            onClick={() => {
              console.log(getSearchResults()?.count);
              if (
                searchBar?.value !== '' &&
                (getSearchResults()?.count ?? 0) > (getPage() + 1) * 10
              ) {
                setPage((page) => page + 1);
                searchAppDB(searchBar?.value ?? '', getPage() * 10);
              }
            }}
          >
            Next
          </button>
        </Center>

        <h2>Apps</h2>
        <p>
          This list only contains the most important Apps. If you do not find the App you are
          looking for you can use the search function above.{' '}
        </p>
      </Show>
      <Box class="bg-gray" minH="100px" borderRadius="$lg">
        <ul class="p-1">
          <For each={getRelevantApps() ?? []}>
            {(res) => (
              <>
                <li>
                  <HStack>
                    <Box class="my-2 p-3.5 bg-background" borderRadius="$lg">
                      <div class="w-25">
                        <img src={res.icon} class="w-7"></img>
                      </div>
                    </Box>
                    <div>
                      <Box
                        class="my-2 ml-3 p-2 bg-background whitespace-nowrap"
                        maxW="280px"
                        minW="280px"
                        borderRadius="$lg"
                      >
                        <p class="truncate ...">{res.name}</p>
                        <p class="truncate ...">{res.executable}</p>{' '}
                      </Box>
                    </div>
                  </HStack>
                </li>
              </>
            )}
          </For>
        </ul>
      </Box>
      <p>Actions</p>
      <Box bg="#C3C2C2" h="200px" borderRadius="$lg"></Box>
    </>
  );
};
