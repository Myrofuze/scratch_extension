(function(Scratch) {
  'use strict';

  class NamedClones {
    constructor() {
      // Stockage des noms de clones par sprite
      this.cloneNames = new WeakMap();
      this.cloneCounter = 0;
      this.pendingCloneName = null;
    }

    getInfo() {
      return {
        id: 'namedclones',
        name: {
          'en': 'Named Clones',
          'fr': 'Clones Nommés',
          'es': 'Clones Nombrados'
        },
        color1: '#FFAB19',
        color2: '#EC9C13',
        color3: '#CF8B17',
        blocks: [
          {
            opcode: 'whenIStartAsNamedClone',
            blockType: Scratch.BlockType.HAT,
            text: {
              'en': 'when I start as a clone named [NAME]',
              'fr': 'quand je commence comme un clone nommé [NAME]',
              'es': 'cuando empiezo como un clon llamado [NAME]'
            },
            isEdgeActivated: false,
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          {
            opcode: 'createNamedCloneOf',
            blockType: Scratch.BlockType.COMMAND,
            text: {
              'en': 'create clone of [TARGET] named [NAME]',
              'fr': 'créer un clone de [TARGET] nommé [NAME]',
              'es': 'crear clon de [TARGET] llamado [NAME]'
            },
            arguments: {
              TARGET: {
                type: Scratch.ArgumentType.STRING,
                menu: 'cloneTarget',
                defaultValue: '_myself_'
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          '---',
          {
            opcode: 'myCloneName',
            blockType: Scratch.BlockType.REPORTER,
            text: {
              'en': 'my clone name',
              'fr': 'mon nom de clone',
              'es': 'mi nombre de clon'
            }
          },
          {
            opcode: 'isCloneNamed',
            blockType: Scratch.BlockType.BOOLEAN,
            text: {
              'en': 'am I clone named [NAME]?',
              'fr': 'suis-je le clone nommé [NAME] ?',
              'es': 'soy el clon llamado [NAME]?'
            },
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          {
            opcode: 'setMyCloneName',
            blockType: Scratch.BlockType.COMMAND,
            text: {
              'en': 'set my clone name to [NAME]',
              'fr': 'mettre mon nom de clone à [NAME]',
              'es': 'fijar mi nombre de clon a [NAME]'
            },
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          '---',
          {
            opcode: 'deleteNamedClones',
            blockType: Scratch.BlockType.COMMAND,
            text: {
              'en': 'delete all clones named [NAME]',
              'fr': 'supprimer tous les clones nommés [NAME]',
              'es': 'borrar todos los clones llamados [NAME]'
            },
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          {
            opcode: 'countNamedClones',
            blockType: Scratch.BlockType.REPORTER,
            text: {
              'en': 'number of clones named [NAME]',
              'fr': 'nombre de clones nommés [NAME]',
              'es': 'número de clones llamados [NAME]'
            },
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          {
            opcode: 'cloneNamedExists',
            blockType: Scratch.BlockType.BOOLEAN,
            text: {
              'en': 'clone named [NAME] exists?',
              'fr': 'le clone nommé [NAME] existe ?',
              'es': 'el clon llamado [NAME] existe?'
            },
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'clone1'
              }
            }
          },
          '---',
          {
            opcode: 'getAllCloneNames',
            blockType: Scratch.BlockType.REPORTER,
            text: {
              'en': 'all clone names',
              'fr': 'tous les noms de clones',
              'es': 'todos los nombres de clones'
            }
          },
          {
            opcode: 'setCloneData',
            blockType: Scratch.BlockType.COMMAND,
            text: {
              'en': 'set clone data [KEY] to [VALUE]',
              'fr': 'mettre donnée clone [KEY] à [VALUE]',
              'es': 'fijar dato clon [KEY] a [VALUE]'
            },
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'data'
              },
              VALUE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '0'
              }
            }
          },
          {
            opcode: 'getCloneData',
            blockType: Scratch.BlockType.REPORTER,
            text: {
              'en': 'clone data [KEY]',
              'fr': 'donnée clone [KEY]',
              'es': 'dato clon [KEY]'
            },
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'data'
              }
            }
          }
        ],
        menus: {
          cloneTarget: {
            acceptReporters: true,
            items: [
              {
                text: {
                  'en': 'myself',
                  'fr': 'moi-même',
                  'es': 'yo mismo'
                },
                value: '_myself_'
              }
            ]
          }
        }
      };
    }

    whenIStartAsNamedClone(args, util) {
      const expectedName = String(args.NAME);
      const target = util.target;
      
      // Vérifier si c'est un clone et s'il a le bon nom
      if (!target.isOriginal) {
        if (this.cloneNames.has(target)) {
          const cloneData = this.cloneNames.get(target);
          return cloneData.name === expectedName;
        }
      }
      
      return false;
    }

    createNamedCloneOf(args, util) {
      const name = String(args.NAME);
      let targetName = args.TARGET;
      
      // Gérer "myself"
      if (targetName === '_myself_') {
        targetName = util.target.sprite.name;
      }
      
      // Stocker le nom pour le prochain clone créé
      this.pendingCloneName = name;
      
      // Trouver le sprite cible
      const stage = util.target.runtime.getTargetForStage();
      const targets = stage ? [stage, ...stage.runtime.targets] : util.target.runtime.targets;
      
      let targetSprite = null;
      for (const target of targets) {
        if (target.sprite && target.sprite.name === targetName && target.isOriginal) {
          targetSprite = target;
          break;
        }
      }
      
      if (!targetSprite) {
        // Si pas trouvé, utiliser le sprite actuel
        targetSprite = util.target;
      }
      
      // Créer le clone
      const clone = targetSprite.makeClone();
      
      if (clone) {
        // Assigner le nom au clone
        this.cloneNames.set(clone, {
          name: name,
          data: {},
          id: ++this.cloneCounter
        });
        
        // Réinitialiser le nom en attente
        this.pendingCloneName = null;
      }
    }

    myCloneName(args, util) {
      const target = util.target;
      
      if (this.cloneNames.has(target)) {
        return this.cloneNames.get(target).name;
      }
      
      return '';
    }

    isCloneNamed(args, util) {
      const name = String(args.NAME);
      const target = util.target;
      
      if (this.cloneNames.has(target)) {
        return this.cloneNames.get(target).name === name;
      }
      
      return false;
    }

    setMyCloneName(args, util) {
      const name = String(args.NAME);
      const target = util.target;
      
      if (!this.cloneNames.has(target)) {
        this.cloneNames.set(target, {
          name: name,
          data: {},
          id: ++this.cloneCounter
        });
      } else {
        const cloneData = this.cloneNames.get(target);
        cloneData.name = name;
      }
    }

    deleteNamedClones(args, util) {
      const name = String(args.NAME);
      const runtime = util.target.runtime;
      
      // Parcourir tous les sprites
      const targets = runtime.targets.slice();
      
      for (const target of targets) {
        if (!target.isOriginal && this.cloneNames.has(target)) {
          const cloneData = this.cloneNames.get(target);
          if (cloneData.name === name) {
            runtime.disposeTarget(target);
          }
        }
      }
    }

    countNamedClones(args, util) {
      const name = String(args.NAME);
      const runtime = util.target.runtime;
      let count = 0;
      
      for (const target of runtime.targets) {
        if (!target.isOriginal && this.cloneNames.has(target)) {
          const cloneData = this.cloneNames.get(target);
          if (cloneData.name === name) {
            count++;
          }
        }
      }
      
      return count;
    }

    cloneNamedExists(args, util) {
      const name = String(args.NAME);
      const runtime = util.target.runtime;
      
      for (const target of runtime.targets) {
        if (!target.isOriginal && this.cloneNames.has(target)) {
          const cloneData = this.cloneNames.get(target);
          if (cloneData.name === name) {
            return true;
          }
        }
      }
      
      return false;
    }

    getAllCloneNames(args, util) {
      const runtime = util.target.runtime;
      const names = new Set();
      
      for (const target of runtime.targets) {
        if (!target.isOriginal && this.cloneNames.has(target)) {
          const cloneData = this.cloneNames.get(target);
          if (cloneData.name) {
            names.add(cloneData.name);
          }
        }
      }
      
      return Array.from(names).join(', ');
    }

    setCloneData(args, util) {
      const key = String(args.KEY);
      const value = args.VALUE;
      const target = util.target;
      
      if (!this.cloneNames.has(target)) {
        this.cloneNames.set(target, {
          name: '',
          data: {},
          id: ++this.cloneCounter
        });
      }
      
      const cloneData = this.cloneNames.get(target);
      cloneData.data[key] = value;
    }

    getCloneData(args, util) {
      const key = String(args.KEY);
      const target = util.target;
      
      if (this.cloneNames.has(target)) {
        const cloneData = this.cloneNames.get(target);
        if (key in cloneData.data) {
          return cloneData.data[key];
        }
      }
      
      return '';
    }
  }

  Scratch.extensions.register(new NamedClones());
})(Scratch);
