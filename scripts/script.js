let PokemonData = {
    Pokemon: null,
    Ability: null,
    Move: null,
};
let baseURL = 'https://pokeapi.co/api/v2/';
let currentPokemonTeam = [];
let classIndex = 1;
let results = {};
let table = {
    title: '',
    PokemonTable: '',
    MoveTable: '',
    AbilityTable: '',
};

$(document).ready(function() {
    init();
    initImageChange();
})

init = () => {
    $('#searchButton').click(evt => {
        results = {};
        table = {
            PokemonTable: '',
            MoveTable: '',
            AbilityTable: '',
        };
        $('.searchInput').val('');
        getType();
    })
    $('.searchInput').change(evt => {
        changeValue(evt.target.id);        
    });
    $('.PokemonImg').click(evt => {
        removePokemon(evt.target.id);
    })
}

changeValue = (id) => {
    PokemonData = {
        ...PokemonData,
        [id] : event.target.value.toLowerCase(),
    }
}

getType = () => {
    let urlAppend = null;
    if (PokemonData.Pokemon) {
        urlAppend = `pokemon/${PokemonData.Pokemon}`;
        getData('pokemon', urlAppend)
    } else if (PokemonData.Ability) {
        urlAppend = `ability/${PokemonData.Ability}`;
        getData('ability', urlAppend)
    } else {
        urlAppend = `move/${PokemonData.Move}`;
        getData('move', urlAppend)
    };
}

getData = (type, urlAppend) => {
    axios({
        method: 'get',
        url:  baseURL + urlAppend
    }).then(res => {
        saveData(type, res);
        showResult(type);
        PokemonData = {
            Pokemon: null,
            Ability: null,
            Move: null,
        } 
    }).catch(err => {
        $('.searchResult').html('<h2>No matching Data. Please Check again.</h2>');
    });
}

saveData = (type, data) => {
    switch(type) {
        case 'pokemon':
            let stats = {
                HP: data.data.stats[5],
                Atk: data.data.stats[4],
                Def: data.data.stats[3],
                SpA: data.data.stats[2],
                SpD: data.data.stats[1],
                Spe: data.data.stats[0],
            }
            results = {
                Pokemon: PokemonData.Pokemon,
                Stats: stats,
                Index: data.data.game_indices[0].game_index,
                Abilities: data.data.abilities,
                Moves: data.data.moves,
            };
            break;
        case 'ability':
            results = {
                Effect: data.data.effect_entries[0].effect,
                Pokemons: data.data.pokemon
            };
            break;
        case 'move':
            results = {
                Effect: data.data.effect_entries[0].effect,
                Power: data.data.power,
                PP: data.data.pp,
                Acuracy: data.data.accuracy,
                Target: data.data.target.name,
                Priority: data.data.priority,
            };
            if (!results.Power) {
                results.Power = '--'
            } 
            break;
        default:    
            return
    }
}

showResult = (type) => {
    if (!PokemonData.Pokemon && !PokemonData.Ability && !PokemonData.Move) {
        $('.searchResult').html('<h2>No matching Data. Please Check again.</h2>');
    } else {
        switch (type) {
            case 'pokemon': 
                setPokemonTable();
                $('.tableTitle').html(table.title);
                $('.tableContent').html(table.PokemonTable);
                $('.addPokemon').click(evt => {
                    addPokemon();
                })
                $('.resetResult').click(evt => {
                    resetResult();
                })            
                break;
            case 'ability': 
                setAbilityTable();
                $('.tableTitle').html(table.title);
                $('.tableContent').html(table.AbilityTable);
                break;
            case 'move':
                setMoveTable();
                $('.tableTitle').html(table.title);
                $('.tableContent').html(table.MoveTable);
                break;
            default:
                return;
        }
    }
}

addPokemon = () => {
    if (currentPokemonTeam.length === 6) { return }
    currentPokemonTeam.push(results.Index);
    currentPokemonTeam.map((member, i) => {
        $(`.TeamSlot${i+1}`).html(
            `<img src="http://bokevon.web.fc2.com/img/sm/${member}.png" alt="PokeDex No.${member}" class = "PokemonImg" id="${i}">`
        )
    })
    $('.PokemonImg').click(evt => {
        removePokemon(evt.target.id);
    })

}

initImageChange = () => {
    let timer = setInterval(changeImage, 3000)
    $('.TeamSanpshot').hover(() => {
        clearInterval(timer);
    }, () => {
        timer = setInterval(changeImage, 3000)
    })
}

changeImage = () => {
    let leftIndex = null;
    let rightIndex = null;
    if ( classIndex == $('.TeamSanpshot').length - 1) {
        classIndex = 0
    } else {
        classIndex += 1;
    };
    leftIndex = classIndex - 1;
    rightIndex  = classIndex + 1;

    if (classIndex == 0) {
        leftIndex = $('.TeamSanpshot').length - 1;
    };
    if (classIndex == $('.TeamSanpshot').length - 1) {
        rightIndex = 0;
    }

    $('.TeamSanpshot').removeClass('middle left right');
    $('.TeamSanpshot').eq(leftIndex).addClass('left');
    $('.TeamSanpshot').eq(classIndex).addClass('middle');
    $('.TeamSanpshot').eq(rightIndex).addClass('right');
}

resetResult = () => {
    $('.searchResult').html('<h2>Search to know more about different Pokemons, Abilities and moves!</h2>');
    $('.searchInput').val('');
    results = {};
    table = '';
    PokemonData = {};
}

setPokemonTable = () => {
    table.title = `<h2 class = "col-10 text-center">${results.Pokemon}</h2>`;
    table.title += '<div class = "col-2"><div class="row">';
    table.title += '<button class = "btn btn-primary addPokemon col-6">+</button>';
    table.title += '<button class = "btn btn-danger resetResult col-6">-</button></div></div>';

    let statName = Object.keys(results.Stats); 
    let stats = Object.values(results.Stats); 
    let abilities = results.Abilities.map(ability => ability.ability.name);

    table.PokemonTable += '<table class="table resultTable col-lg-6 col-xs-12 col-sm-12">';
    table.PokemonTable += `<caption class="text-center">Base Stats</caption>`;
    table.PokemonTable += '<tr><td>Index</td>';
    table.PokemonTable += `<td>${results.Index}</td>`;    

    for (let i = 0; i <= 5; i ++) {
        table.PokemonTable += `<tr><td>${statName[i]}</td>`;
        table.PokemonTable += `<td>${stats[i].base_stat}</td>`;    
    };
    for ( let i = 0; i < abilities.length; i++) {
        table.PokemonTable += `<tr><td>Ability ${i+1}</td>`;
        table.PokemonTable += '<td>' + abilities[i] + '</td>';
    };
    table.PokemonTable += '</tr></table>'

    let moves = results.Moves.map(move => move.move.name);

    table.PokemonTable += '<table class="table resultTable col-lg-6 col-xs-12 col-sm-12">';
    table.PokemonTable += `<caption class="text-center">Moves</caption>`;
    for ( let i = 0; i < moves.length; i++) {
        table.PokemonTable += `<tr><td>Move ${i+1}</td>`;
        table.PokemonTable += '<td>' + moves[i] +'</td>';
    }
    table.PokemonTable += '</tr></table>'
}

setAbilityTable = () => {
    table.title = `<div class="col text-center"><h2>${PokemonData.Ability}</h2></div>`;
    table.AbilityTable += '<table class="table resultTable">';
    table.AbilityTable += '<caption class="text-center">Description and Pokemons with this ability</caption>';
    table.AbilityTable += '<tr><td>Description</td>';
    table.AbilityTable += `<td>${results.Effect}</td>`;
    results.Pokemons.map((Pokemon, index) => {
        table.AbilityTable += `<tr><td>Pokemon ${index+1}</td>`;
        table.AbilityTable += `<td>${Pokemon.pokemon.name}</td>`;
    })
    table.AbilityTable += '</tr></table>';
}

setMoveTable = () => {
    table.title = `<div class="col text-center"><h2>${PokemonData.Move}</h2></div>`;
    table.MoveTable += '<table class="table resultTable">';
    table.MoveTable += '<caption class="text-center">Description of the move</caption>';
    let features = Object.keys(results);
    features.map(feature => {
        table.MoveTable += `<tr><td>${feature}</td>`;
        table.MoveTable += `<td>${results[feature]}</td>`;
    })    
    table.MoveTable += '</tr></table>';
}

removePokemon = (id) => {
    currentPokemonTeam.splice(id, 1);
    currentPokemonTeam.map((member, i) => {
        $(`.TeamSlot${i+1}`).html(
            `<img src="http://bokevon.web.fc2.com/img/sm/${member}.png" alt="PokeDex No.${member}" class = "PokemonImg" id="${i}">`
        );
    })
    for (i = 0; i< 6 - currentPokemonTeam.length; i ++) {
        $(`.TeamSlot${6-i}`).html('');
    }
    $('.PokemonImg').click(evt => {
        removePokemon(evt.target.id);
    })    
}