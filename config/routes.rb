Checklisthub::Application.routes.draw do
  devise_for :users

  resources :lists
  root :to => "lists#new"
end
