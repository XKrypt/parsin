## Other Languages
[English](#english)

# Parsin

Parsin é um mini banco de dados  no mesmo estilo do SQLite, onde cria um arquivo para salvar dados localmente, porém utilizando JSON. Foi feito para ser utilizado em aplicações que guardam localmente dados de configuração ou pequenas informações. Parsin é simples e pequeno, o nome foi escolhido do latim _**parvis et simplicibus**_ (Pequeno e simples) .

>Par: *parvis*, 
>
>sin: *simplicibus*

---
## Links
### GitHub : https://github.com/XKrypt/parsin
### NPM : https://www.npmjs.com/package/parsin

---

## Como funciona?

Parsin salva os dados em grupos. Dentro do banco de dados, ele cria um grupo onde seus dados serão guardados, então cada dado é salvo dentro de uma caixa que chamamos de `DataBox`. Dentro do `DataBox` é salvo o dado e um `id`.

### Group

Seus **DataBox** são salvos dentro dos grupos, sua estrutura é como no exemplo abaixo:
```yml
{
  key: string,
  idCount: number,
  data: DataBox[]
}
```

### DataBox

Seus dados são salvos dentro de um tipo chamado **DataBox**, sua estrutura é como no exemplo abaixo:

```yml
{
  id: number,
  data: any
}
```

---

## Instalando

```bash
npm install parsin
```

### Importação

#### Require

```js
const { parsin } = require('parsin');
```

#### Import
```js
import { Parsin } from Parsin;
```

## Inicializando

Para iniciar, primeiro aponte o diretório do arquivo a ser criado. Parsin criará automaticamente o arquivo caso ele não exista, mas não criará o diretório, então certifique-se que as pastas a serem utilizadas existam.
```js
const database = new Parsim('seu/diretorio/database.json', true, 'utf8');
```

O segundo argumento diz se deve carregar todos os dados em memória ou não, se sim ele carrega todos os grupos de dados dentro da classe, se não ele vai constantemente acessar o arquivo para gravar e ler os dados, o terceiro diz que codificação deve ser usada para gravar os dados. Todas as modificações feitas são salvas automaticamente.

> **Obs.: Não é necessário que o arquivo seja .json.**

### Criando grupos de dados

Para criar um grupo de dados é simples, apenas diga o nome do grupo e opcionalmente a partir de qual numero o id deve começar a contar.
```js
database.addGroup("nome do grupo", 5)
```

Com isso o primeiro dado vai ter o id 5 o seguinte 6 e assim por diante.

### Adicionando dados

Basta dizer o nome do grupo e como segundo parâmetro o dado.
```js
database.addData("nome do grupo", {algum : "valor"})
```

### Acessando dados

Você pode acessar um único dado, todos os dados ou uma seleção de dados.

#### Um único dado

retorna o primeiro dado encontrado.
```js
database.getSingleData("nome do grupo", dataBox => dataBox.id == 0)
```
Se não for encontrado será retornado `undefined`

#### Todos os dados
```js
database.getAllData("nome do grupo")
```
Se não for encontrado será retornado um array vazio.

#### Uma seleção de dados
```js
database.getMultipleData("nome do grupo", dataBox => dataBox.id => 5)
```
Se não for encontrado será retornado um array vazio.

Lembre-se que você pode acessar o seu dado dentro do DataBox, exemplo :
```js
database.getSingleData("nome do grupo", dataBox => dataBox.data.nome == 'Parsin')
```

### Editando dados

Para editar um dado é necessário saber sua `id` , e o nome do grupo de dados.
```js
database.editData("nome do grupo", 1, {alguma:'coisa'})
```
### Removendo dados

Como no exemplo acima basta passar uma arrow function como segundo parâmetro para assim selecionar o dado a ser excluído.
```js
database.removeData("nome do grupo", valor => valor.id == 5)
```

Lembrando que o valor é um **DataBox**, então para acessar o dado pode utilizar `valor.data`. 

Você pode também remover vários dados usado a mesma função da seguinte forma
```js
database.removeData("nome do grupo", valor => valor.id > 2)
```

`removeData` filtra os dados e remove aqueles que retornam `true`.

### Removendo grupos

Você pode também remover um ou vários grupos de dados, lembrando que todos os dados dentro do grupo serão apagados.
```js
database.removeGroup(grupo => grupo.key == "meu grupo")
```

### Filtrar dados

Você pode filtrar os dados ao adicionar ou editar os dados e impedir que um dado seja adicionado ou editado se não atender uma condição.
Para isso ative os filtros ao criar o banco de dados adicionando um quarto parâmetro com o valor ``true``.
```js
const database = new Parsim('seu/diretorio/database.json', true, 'utf8',true);
```

Após isso basta criar o filtro como no exemplo abaixo.
```js
database.addFilter({
            event: DataEvent.OnAddData, //Evento em que o filtro vai rodar
            group : 'jest', //O grupo que o filtro deve filtrar

            //A função que irá filtrar os dados
            function : (data) => {

              //Nesse caso qualquer dado que seja diferente de "im fine" não será adicionado.
                    if (data == "im fine") {
                        return true
                    }
                    return false
            }
        })

//Essa dado não vai ser adicionado
database.addData("jest","im not fine");
```
Você pode adicionar vários filtros para um grupo, se um dos filtros retornar ``false`` o dado não será adicionado.

Você pode fazer o mesmo para editar dados.
```js
database.addFilter({
            event: DataEvent.OnEditData,
            group : 'jest',
            function : (data) => {
                    if (data == "im fine") {
                        return true
                    }
                    return false
            }
        })

//Essa dado não vai ser editado
database.editaData("jest",1,"jest","im not fine");
```

### Manipulação de dados
Você pode manipular os dados antes de adiciona-los ou edita-los, funciona como os filtros a diferença é que você vai alterar o dado antes de inseri-lo ou edita-lo. As manipulações são feitas antes de passar pelos filtros.

Para ativar as manipulações de dados basta adicionar um quinto parâmetro com o valor ``true``

```js
const database = new Parsim('seu/diretorio/database.json', true, 'utf8',true,true);

//Se você não precisa de filtros, basta adicionar false ao quarto parâmetro.
```
Após isso basta criar o manipulador como no exemplo abaixo.
```js
database.addManipulation({
            event: DataEvent.OnAddData,
            group : 'jest',
            function : (data:any ):any => {

                    return data + ", and i need coffe." 
            }
        })

database.addData("jest","im fine");
//O resultado será "im fine, and i need coffe."
```

Você pode fazer o mesmo para editar dados.

```js
database.addManipulation({
            event: DataEvent.OnEditData,
            group : 'jest',

            //neste caso a função irá adicionar ",and i need coffe" para qualquer dado novo.
            function : (data:any ):any => {

                    return data + ", and i need coffe." 
            }
        })

database.addData("jest","im fine");
database.editData("jest",1,"im not fine");
//O resultado será "im not fine, and i need coffe."
```
### Outras funções

#### Seleciona um grupo de dados
```js
getGroup('seu grupo')
```

#### Seleciona múltiplos grupos
```js
getMultipleGroups(group => group.data.length > 0)
```

#### Substitui um grupo
```js
replaceGroup('nome do grupo',{
  key : 'novo nome',
  idCount: '3',
  data: []
})
```

---


# Other languages:

# English

<br />


# Parsin 

Parsin is a mini database in the same style as SQLite, where it creates a file to save data locally, but using JSON. It was made to be used in applications that store configuration data or small information locally. Parsin is simple and small, the name was chosen from the Latin _**parvis et simplicibus**_ (Small and simple).

>Par: *parvis*, 
>
>sin: *simplicibus*

---

## Links
### GitHub : https://github.com/XKrypt/parsin
### NPM : https://www.npmjs.com/package/parsin

---

## How it works?

Parsin saves data in groups. Inside the database, it creates a group where your data will be stored, so each data is saved inside a box we call `DataBox`. Inside the `DataBox` the data and an `id` are saved.

### Group

Your **DataBox** are saved inside the groups, their structure is as in the example below:
```yml
{
  key: string,
  idCount: number,
  data: DataBox[]
}
```

### DataBox

Your data is saved inside a type called **DataBox**, its structure is as in the example below:

```yml
{
  id: number,
  data: any
}
```

---

## Instaling

```bash
npm install parsin
```

### Importing

#### Require

```js
const { parsin } = require('parsin');
```

#### Import
```js
import { Parsin } from Parsin;
```

## Initializing

To start, first point to the directory of the file to be created. Parsin will automatically create the file if it doesn't exist, but it won't create the directory, so make sure the folders to use exist.
```js
const database = new Parsim('you/directory/database.json', true, 'utf8');
```

The second argument says whether to load all data into memory or not, if yes it loads all data groups inside the class, if not it will constantly access the file to write and read the data, the third says what encoding should be used to record the data. All changes made are automatically saved.

> **Note: It is not necessary for the file to be .json.**

### Creating data groups

To create a data group is simple, just say the name of the group and optionally from which number the id should start counting.
```js
database.addGroup("group name", 5)
```

With that the first data will have the id 5 the next 6 and so on.

### Adding data

Just say the name of the group and the data as the second parameter.

```js
database.addData("group name", {some : "value"})
```

### Accessing data

You can access single data, all data, or a selection of data.

#### A single data

returns the first data found.
```js
database.getSingleData("group name", dataBox => dataBox.id == 0)
```
If not found, `undefined` will be returned.

#### All data
```js
database.getAllData("group name")
```
If not found, an empty array will be returned.

#### A selection of data
```js
database.getMultipleData("group name", dataBox => dataBox.id => 5)
```
If not found, an empty array will be returned.

Remember that you can access your data inside the DataBox, for example:
```js
database.getSingleData("group name", dataBox => dataBox.data.nome == 'Parsin')
```

### Editing data

To edit a data it is necessary to know its `id` , and the name of the data group.
```js
database.editData("group name", 1, {alguma:'coisa'})
```
### Removing data

As in the example above, just pass an arrow function as the second parameter to select the data to be deleted.
```js
database.removeData("group name", valor => valor.id == 5)
```

Remembering that the value is a **DataBox**, so to access the data you can use `value.data`.

You can also remove multiple data used with the same function as follows
```js
database.removeData("group name", value => value.id > 2)
```

`removeData` filters the data and removes those that return `true`.

### Removing groups

You can also remove one or several groups of data, remembering that all data within the group will be deleted.
```js
database.removeGroup(grupo => grupo.key == "my group")
```
### Filter Data

You can filter data when adding or editing data and prevent data from being added or edited if it does not meet a condition.
To do this activate the filters when creating the database by adding a fourth parameter with the value ``true``.
```js
const database = new Parsim('your/directory/database.json', true, 'utf8',true);
```

Then simply create the filter as in the example below.
```js
database.addFilter({
            event: DataEvent.OnAddData, //Event that the filter will run
            group : 'jest', //The group that the filter should filter

            //The function that will filter the data
            function : (data) => {

              //In this case any data that is different from "im fine" will not be added.
                    if (data == "im fine") {
                        return true
                    }
                    return false
            }
        })

//Essa dado não vai ser adicionado
database.addData("jest","im not fine");
```
You can add several filters to a group, if one of the filters returns ``false`` the data is not added.

You can do the same to edit data.
```js
database.addFilter({
            event: DataEvent.OnEditData,
            group : 'jest',
            function : (data) => {
                    if (data == "im fine") {
                        return true
                    }
                    return false
            }
        })

//This data will not be edited
database.editaData("jest",1,"jest","im not fine");
```

### Data Manipulation
You can manipulate the data before you add or edit it, it works like filters, the difference is that you will change the data before you insert or edit it. The manipulations are done before going through the filters.

To enable data manipulation, simply add a fifth parameter with the value ``true``.

```js
const database = new Parsim('your/directory/database.json', true, 'utf8',true,true);
//if you don´t need filters, simple add false to fourth parameter
```

```js
database.addManipulation({
            event: DataEvent.OnAddData,
            group : 'jest',
            function : (data:any ):any => {

                    return data + ", and i need coffe." 
            }
        })

database.addData("jest","im fine");
//The result will be "im fine, and i need coffe."
```

You can do the same to edit data

```js
database.addManipulation({
            event: DataEvent.OnEditData,
            group : 'jest',

            //in this case the function will add ",and i need coffe" to any new data.
            function : (data:any ):any => {

                    return data + ", and i need coffe." 
            }
        })

database.addData("jest","im fine");
database.editData("jest",1,"im not fine");
//The result will be "im not fine, and i need coffe."
```

### Other functions

#### Select a data group
```js
getGroup('your group')
```

#### Select multiple groups
```js
getMultipleGroups(group => group.data.length > 0)
```

#### Replace group
```js
replaceGroup('group name',{
  key : 'new name',
  idCount: '3',
  data: []
})
```