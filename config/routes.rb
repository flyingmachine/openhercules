Checklisthub::Application.routes.draw do
  devise_for :users

  resources :lists
  resource  :home
  root :to => "home#show"
end
