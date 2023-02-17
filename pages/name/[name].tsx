import { useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { Grid, Card, Text, Button, Container, Image } from '@nextui-org/react';
import { Layout } from '../../components/layouts';
import pokeApi from '../../api/pokeApi';
import { PokemonListResponse, Pokemon, PokemonResult } from '../../interfaces';
import { capitalize, localFavorites } from '../../utils';
import confetti from 'canvas-confetti';

type Props = { pokemon: PokemonResult };

const PokemonByNamePage = ({ pokemon }: Props) => {

  const [isInFavorites, setIsInFavorites] = useState<boolean>(
    localFavorites.existInPokemon(pokemon.id)
  );

  const onToggleFavorite = () => {
    localFavorites.toggleFavorite(pokemon.id);
    setIsInFavorites(!isInFavorites);

    if (!isInFavorites) {
      confetti({
        zIndex: 999,
        particleCount: 100,
        spread: 160,
        angle: -100,
        origin: { x: 1, y: 0 },
      });
    }
  };

  return (
    <Layout title={`${ capitalize(pokemon.name) } Pokemon`}>
      <Grid.Container css={{ marginTop: '5px' }} gap={ 2 }>
        <Grid xs={ 12 } sm={ 4 }>
          <Card isHoverable css={{ padding: '30px' }}>
            <Card.Body>
              <Card.Image
                src={ pokemon.image ?? '/no-image.png' }
                alt={ pokemon.name }
                width="100%"
                height={ 200 }
              />
            </Card.Body>
          </Card>
        </Grid>
        <Grid xs={ 12 } sm={ 8 }>
          <Card>
            <Card.Header css={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text h1 transform='capitalize'>{ pokemon.name }</Text>

              <Button
                color="gradient"
                ghost={ isInFavorites ? false : true }
                onPress={ onToggleFavorite }
              >
                { isInFavorites ? 'In Favorites' : 'Save in Favorites' }
              </Button>

            </Card.Header>
            <Card.Body>
              <Text size={ 30 }>Sprites:</Text>
              <Container direction='row' display='flex'>
                <Image
                  src={ pokemon.front_default }
                  alt={ pokemon.name }
                  width={ 100 }
                  height={ 100 }
                />
                <Image
                  src={ pokemon.front_shiny }
                  alt={ pokemon.name }
                  width={ 100 }
                  height={ 100 }
                />
                <Image
                  src={ pokemon.back_default }
                  alt={ pokemon.name }
                  width={ 100 }
                  height={ 100 }
                />
                <Image
                  src={ pokemon.back_shiny }
                  alt={ pokemon.name }
                  width={ 100 }
                  height={ 100 }
                />
              </Container>
            </Card.Body>
          </Card>
        </Grid>
      </Grid.Container>
    </Layout>
  );
};

const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await pokeApi.get<PokemonListResponse>(`/pokemon?limit=151`);
  const pokemonNames: string[] = data.results.map(pokemon => pokemon.name);

  return {
    paths: pokemonNames.map(name => ({ params: { name }})),
    fallback: false,
  };
};

const getStaticProps: GetStaticProps = async ({ params }) => {
  const { name } = params as { name: string };
  const { data } = await pokeApi.get<Pokemon>(`/pokemon/${ name }`);

  return {
    props: {
      pokemon: {
        id: data.id,
        name: data.name,
        image: data.sprites.other?.dream_world.front_default ?? '/no-image.png',
        front_default: data.sprites.front_default,
        back_default: data.sprites.back_default,
        front_shiny: data.sprites.front_shiny,
        back_shiny: data.sprites.back_shiny,
      },
    },
  };
};

export {
  getStaticPaths,
  getStaticProps,
  PokemonByNamePage as default,
};